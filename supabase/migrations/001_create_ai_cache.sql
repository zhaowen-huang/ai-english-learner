-- AI 生成内容缓存表
-- 用于存储所有通过 AI 生成的内容，避免重复调用产生费用

CREATE TABLE IF NOT EXISTS ai_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_type TEXT NOT NULL CHECK (content_type IN (
    'word_detail',
    'word_detail_with_context',
    'translate_text',
    'translate_sentences'
  )),
  content_hash TEXT NOT NULL, -- 输入内容的哈希值，用于快速查找
  input_data JSONB, -- 存储输入参数
  output_data JSONB NOT NULL, -- 存储 AI 生成的结果
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- 确保相同类型的相同输入只有一条记录
  CONSTRAINT unique_content_type_hash UNIQUE (content_type, content_hash)
);

-- 创建索引加速查询
CREATE INDEX IF NOT EXISTS idx_ai_cache_content_type ON ai_cache(content_type);
CREATE INDEX IF NOT EXISTS idx_ai_cache_content_hash ON ai_cache(content_hash);
CREATE INDEX IF NOT EXISTS idx_ai_cache_type_hash ON ai_cache(content_type, content_hash);

-- 添加注释
COMMENT ON TABLE ai_cache IS 'AI 生成内容缓存表，用于存储所有 AI 生成的内容以避免重复调用';
COMMENT ON COLUMN ai_cache.content_type IS '内容类型：word_detail(单词详情), word_detail_with_context(带上下文的单词详情), translate_text(文本翻译), translate_sentences(句子翻译)';
COMMENT ON COLUMN ai_cache.content_hash IS '输入内容的哈希值，用于快速匹配';
COMMENT ON COLUMN ai_cache.input_data IS '存储输入参数，便于调试和重新生成';
COMMENT ON COLUMN ai_cache.output_data IS 'AI 生成的结果数据';
