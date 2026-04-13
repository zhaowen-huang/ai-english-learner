#!/usr/bin/env node

/**
 * AI 缓存表迁移脚本
 * 直接在 Supabase 中创建 ai_cache 表
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// 从环境变量或配置文件读取 Supabase 配置
const SUPABASE_URL = process.env.SUPABASE_URL || 'YOUR_SUPABASE_URL';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'YOUR_SERVICE_ROLE_KEY';

console.log('🚀 Starting AI Cache migration...\n');

// 检查配置
if (SUPABASE_URL === 'YOUR_SUPABASE_URL' || SUPABASE_SERVICE_ROLE_KEY === 'YOUR_SERVICE_ROLE_KEY') {
  console.error('❌ Error: Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables');
  console.error('\nExample:');
  console.error('export SUPABASE_URL=https://your-project.supabase.co');
  console.error('export SUPABASE_SERVICE_ROLE_KEY=your-service-role-key\n');
  process.exit(1);
}

// 创建 Supabase 客户端（使用 service role key 以绕过 RLS）
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function runMigration() {
  try {
    // 读取 SQL 文件
    const sqlPath = path.join(__dirname, '../supabase/migrations/001_create_ai_cache.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');

    console.log('📄 Reading migration file...');
    console.log(`   File: ${sqlPath}\n`);

    // 分割 SQL 语句（按分号分割）
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    console.log(`📝 Found ${statements.length} SQL statements to execute\n`);

    // 执行每个 SQL 语句
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      console.log(`⚙️  Executing statement ${i + 1}/${statements.length}...`);
      
      try {
        const { error } = await supabase.rpc('exec_sql', { sql: statement });
        
        if (error) {
          // 如果 exec_sql RPC 不存在，尝试直接执行
          console.log('   ⚠️  RPC not available, trying alternative method...');
          
          // 对于 CREATE TABLE 等 DDL 语句，需要使用 REST API
          // 这里我们简单提示用户手动执行
          throw new Error(`Statement execution failed. Please execute manually in Supabase Dashboard.`);
        }
        
        console.log('   ✅ Success\n');
      } catch (err) {
        console.error(`   ❌ Failed: ${err.message}\n`);
        console.log('💡 Tip: You can execute the SQL manually in Supabase Dashboard:\n');
        console.log('1. Go to https://supabase.com/dashboard');
        console.log('2. Select your project');
        console.log('3. Navigate to SQL Editor');
        console.log('4. Copy and paste the content from:');
        console.log(`   ${sqlPath}\n`);
        throw err;
      }
    }

    console.log('✅ Migration completed successfully!\n');
    
    // 验证表是否创建成功
    console.log('🔍 Verifying table creation...');
    const { data, error } = await supabase
      .from('ai_cache')
      .select('*')
      .limit(1);
    
    if (error) {
      if (error.code === '42P01') {
        console.error('❌ Table "ai_cache" does not exist. Migration may have failed.');
      } else {
        console.error('⚠️  Verification query failed:', error.message);
      }
    } else {
      console.log('✅ Table "ai_cache" exists and is accessible!\n');
    }

    console.log('🎉 All done! You can now use the AI cache system.\n');
    
  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    process.exit(1);
  }
}

// 运行迁移
runMigration();
