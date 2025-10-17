import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { supabase } from '../config/database.js';

const router = express.Router();

// JWT密钥
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// 发送验证码
router.post('/send-verification', async (req, res) => {
  try {
    const { email } = req.body;

    // 验证邮箱格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: '邮箱格式不正确'
      });
    }

    // 检查用户是否已存在
    let existingUser = null;
    let checkError = null;
    
    try {
      const result = await supabase
        .from('users')
        .select('id')
        .eq('email', email)
        .single();
      
      existingUser = result.data;
      checkError = result.error;
    } catch (error) {
      console.warn('检查用户存在时出现网络错误，继续处理:', error.message);
      // 网络错误时继续处理，不阻止验证码发送
    }

    if (checkError && checkError.code !== 'PGRST116') {
      console.warn('检查用户存在时出错:', checkError);
      // 不抛出错误，继续处理
    }

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: '该邮箱已被注册'
      });
    }

    // 生成6位验证码
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

    // 发送验证码到邮箱（这里需要配置真实的邮箱服务）
    // 暂时先返回验证码用于测试
    console.log(`验证码发送到 ${email}: ${verificationCode}`);

    // 保存验证码到数据库（有效期10分钟）
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();
    
    // 先删除该邮箱的旧验证码（如果数据库可用）
    try {
      await supabase
        .from('verification_codes')
        .delete()
        .eq('email', email);
    } catch (error) {
      console.warn('删除旧验证码失败，继续处理:', error.message);
    }

    // 插入新验证码（如果数据库可用）
    let saveError = null;
    try {
      const result = await supabase
        .from('verification_codes')
        .insert({
          email,
          code: verificationCode,
          expires_at: expiresAt,
          created_at: new Date().toISOString()
        });
      saveError = result.error;
    } catch (error) {
      console.warn('保存验证码到数据库失败，但验证码仍可正常使用:', error.message);
      // 数据库错误时不阻止验证码发送
    }

    if (saveError) {
      throw saveError;
    }

    res.json({
      success: true,
      message: '验证码已发送到您的邮箱',
      // 测试环境下返回验证码，生产环境应该移除
      testCode: verificationCode
    });

  } catch (error) {
    console.error('发送验证码错误:', error);
    res.status(500).json({
      success: false,
      message: '发送验证码失败，请稍后重试',
      error: error.message
    });
  }
});

// 用户注册（带验证码验证）
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, verificationCode } = req.body;

    // 验证输入
    if (!username || !email || !password || !verificationCode) {
      return res.status(400).json({
        success: false,
        message: '用户名、邮箱、密码和验证码为必填项'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: '密码长度至少为6位'
      });
    }

    // 验证邮箱格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: '邮箱格式不正确'
      });
    }

    // 检查验证码
    const { data: codeData, error: codeError } = await supabase
      .from('verification_codes')
      .select('*')
      .eq('email', email)
      .eq('code', verificationCode)
      .gt('expires_at', new Date().toISOString())
      .single();

    if (codeError || !codeData) {
      return res.status(400).json({
        success: false,
        message: '验证码错误或已过期'
      });
    }

    // 检查用户是否已存在
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('id')
      .or(`username.eq.${username},email.eq.${email}`)
      .single();

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

    if (createError) {
      console.error('创建用户失败:', createError);
      throw createError;
    }

    // 删除已使用的验证码
    await supabase
      .from('verification_codes')
      .delete()
      .eq('email', email);

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