import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { supabase } from '../config/database.js';

const router = express.Router();

// JWT密钥
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// 用户注册
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // 验证输入
    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: '用户名、邮箱和密码为必填项'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: '密码长度至少为6位'
      });
    }

    // 检查用户是否已存在
    console.log('检查用户是否存在:', { username, email });
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('id')
      .or(`username.eq.${username},email.eq.${email}`)
      .single();

    console.log('检查结果:', { existingUser, checkError });

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('检查用户存在时出错:', checkError);
      throw checkError;
    }

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: '用户名或邮箱已存在'
      });
    }

    // 加密密码
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // 创建用户
    console.log('开始创建用户...');
    const { data: newUser, error: createError } = await supabase
      .from('users')
      .insert({
        username,
        email,
        password: hashedPassword,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    console.log('创建用户结果:', { newUser, createError });

    if (createError) {
      console.error('创建用户失败:', createError);
      throw createError;
    }

    // 生成JWT令牌
    const token = jwt.sign(
      { userId: newUser.id, username: newUser.username },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      message: '注册成功',
      data: {
        user: {
          id: newUser.id,
          username: newUser.username,
          email: newUser.email
        },
        token
      }
    });

  } catch (error) {
    console.error('用户注册失败 - 详细错误信息:', error);
    console.error('错误堆栈:', error.stack);
    res.status(500).json({
      success: false,
      message: '注册失败，请稍后重试',
      error: error.message
    });
  }
});

// 用户登录
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // 验证输入
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: '邮箱和密码为必填项'
      });
    }

    // 查找用户
    const { data: user, error: findError } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (findError || !user) {
      return res.status(401).json({
        success: false,
        message: '邮箱或密码错误'
      });
    }

    // 验证密码
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: '邮箱或密码错误'
      });
    }

    // 生成JWT令牌
    const token = jwt.sign(
      { userId: user.id, username: user.username },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      message: '登录成功',
      data: {
        user: {
          id: user.id,
          username: user.username,
          email: user.email
        },
        token
      }
    });

  } catch (error) {
    console.error('用户登录失败:', error);
    res.status(500).json({
      success: false,
      message: '登录失败，请稍后重试',
      error: error.message
    });
  }
});

// 获取当前用户信息
router.get('/me', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: '未提供认证令牌'
      });
    }

    // 验证JWT令牌
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // 获取用户信息
    const { data: user, error } = await supabase
      .from('users')
      .select('id, username, email, created_at')
      .eq('id', decoded.userId)
      .single();

    if (error || !user) {
      return res.status(401).json({
        success: false,
        message: '用户不存在'
      });
    }

    res.json({
      success: true,
      data: { user }
    });

  } catch (error) {
    console.error('获取用户信息失败:', error);
    res.status(401).json({
      success: false,
      message: '认证令牌无效',
      error: error.message
    });
  }
});

// 更新用户信息
router.put('/profile', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: '未提供认证令牌'
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const { username, email } = req.body;

    // 验证输入
    if (!username && !email) {
      return res.status(400).json({
        success: false,
        message: '请提供要更新的信息'
      });
    }

    const updateData = { updated_at: new Date().toISOString() };
    if (username) updateData.username = username;
    if (email) updateData.email = email;

    // 更新用户信息
    const { data: updatedUser, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', decoded.userId)
      .select('id, username, email, created_at')
      .single();

    if (error) {
      throw error;
    }

    res.json({
      success: true,
      message: '用户信息更新成功',
      data: { user: updatedUser }
    });

  } catch (error) {
    console.error('更新用户信息失败:', error);
    res.status(500).json({
      success: false,
      message: '更新失败，请稍后重试',
      error: error.message
    });
  }
});

export default router;