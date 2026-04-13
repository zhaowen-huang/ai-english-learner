-- 为 vocabularies 表添加上下文句子和文章地址字段
ALTER TABLE vocabularies
ADD COLUMN IF NOT EXISTS context_sentence TEXT,
ADD COLUMN IF NOT EXISTS article_url TEXT;

-- 添加注释
COMMENT ON COLUMN vocabularies.context_sentence IS '单词所在的句子上下文';
COMMENT ON COLUMN vocabularies.article_url IS '文章来源地址';
