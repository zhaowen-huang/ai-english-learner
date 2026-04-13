#!/bin/bash

# Supabase 项目链接和迁移脚本

echo "🔗 Linking to your Supabase project..."
echo ""
echo "请在 Supabase Dashboard 中找到你的项目引用 ID："
echo "1. 访问 https://supabase.com/dashboard"
echo "2. 选择你的项目"
echo "3. 进入 Settings → General"
echo "4. 复制 'Project ID' (格式类似: xxxxxxxxxxxxxx)"
echo ""
read -p "请输入你的 Supabase Project ID: " PROJECT_ID

if [ -z "$PROJECT_ID" ]; then
    echo "❌ 错误: Project ID 不能为空"
    exit 1
fi

echo ""
echo "🔗 正在链接到项目: $PROJECT_ID"
supabase link --project-ref "$PROJECT_ID"

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ 项目链接成功！"
    echo ""
    echo "📝 检查待执行的迁移..."
    supabase db remote commit
    
    echo ""
    echo "🚀 执行迁移..."
    supabase db push
    
    echo ""
    echo "✅ 迁移完成！"
    echo ""
    echo "🔍 验证表是否创建..."
    echo "你可以在 Supabase Dashboard 的 Table Editor 中查看 ai_cache 表"
else
    echo ""
    echo "❌ 链接失败，请检查 Project ID 是否正确"
    exit 1
fi
