import express from 'express';
import nodemailer from 'nodemailer';
import { supabase } from '../config/database.js';

const router = express.Router();

// 创建邮件传输器（使用QQ邮箱示例）
const transporter = nodemailer.createTransport({
  host: 'smtp.qq.com',
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER, // 发件人邮箱
    pass: process.env.EMAIL_PASS  // 邮箱授权码
  }
});

// 生成6位数字验证码
function generateVerificationCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// 发送验证码到邮箱
router.post('/send-code', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: '邮箱地址为必填项'
      });
    }

    // 验证邮箱格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: '请输入有效的邮箱地址'
      });
    }

    // 检查邮箱是否已被注册
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: '该邮箱已被注册'
      });
    }

    // 生成验证码
    const code = generateVerificationCode();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10分钟后过期

    // 保存验证码到数据库
    const { error: saveError } = await supabase
      .from('verification_codes')
      .upsert({
        email,
        code,
        expires_at: expiresAt.toISOString(),
        created_at: new Date().toISOString()
      }, {
        onConflict: 'email'
      });

    if (saveError) {
      console.error('保存验证码失败:', saveError);
      throw saveError;
    }

    // 发送邮件
    const mailOptions = {
      from: `"诗词鉴赏系统" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: '邮箱验证码 - 诗词鉴赏系统',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">诗词鉴赏系统 - 邮箱验证</h2>
          <p>您好！</p>
          <p>您正在注册诗词鉴赏系统账号，验证码为：</p>
          <div style="background: #f5f5f5; padding: 20px; text-align: center; margin: 20px 0;">
            <span style="font-size: 32px; font-weight: bold; color: #3b82f6; letter-spacing: 8px;">${code}</span>
          </div>
          <p>验证码有效期为10分钟，请尽快使用。</p>
          <p>如果这不是您本人的操作，请忽略此邮件。</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="color: #666; font-size: 12px;">此邮件由系统自动发送，请勿回复。</p>
        </div>
      `
    };

    // 如果配置了邮箱，则发送邮件；否则直接返回验证码（用于开发测试）
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      await transporter.sendMail(mailOptions);
      console.log(`验证码已发送到邮箱: ${email}`);
    } else {
      console.log(`开发模式 - 验证码: ${code} (邮箱: ${email})`);
    }

    res.json({
      success: true,
      message: '验证码已发送到您的邮箱',
      // 开发模式下返回验证码便于测试
      ...(process.env.NODE_ENV === 'development' && { debug_code: code })
    });

  } catch (error) {
    console.error('发送验证码失败:', error);
    res.status(500).json({
      success: false,
      message: '发送验证码失败，请稍后重试'
    });
  }
});

// 验证验证码
router.post('/verify-code', async (req, res) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({
        success: false,
        message: '邮箱和验证码为必填项'
      });
    }

    // 查找验证码记录
    const { data: verification, error: findError } = await supabase
      .from('verification_codes')
      .select('*')
      .eq('email', email)
      .single();

    if (findError || !verification) {
      return res.status(400).json({
        success: false,
        message: '验证码无效或已过期'
      });
    }

    // 检查验证码是否过期
    if (new Date(verification.expires_at) < new Date()) {
      // 删除过期的验证码
      await supabase
        .from('verification_codes')
        .delete()
        .eq('email', email);

      return res.status(400).json({
        success: false,
        message: '验证码已过期，请重新获取'
      });
    }

    // 验证验证码
    if (verification.code !== code) {
      return res.status(400).json({
        success: false,
        message: '验证码错误'
      });
    }

    // 验证成功后删除验证码记录
    await supabase
      .from('verification_codes')
      .delete()
      .eq('email', email);

    res.json({
      success: true,
      message: '验证码验证成功'
    });

  } catch (error) {
    console.error('验证验证码失败:', error);
    res.status(500).json({
      success: false,
      message: '验证失败，请稍后重试'
    });
  }
});

export default router;