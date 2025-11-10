import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Bold, Italic, Underline, List, Link, Image, Code, Eye, Save, Trash2, 
  FileText, Clock, CheckCircle, X, Plus, Heading2, Quote
} from 'lucide-react';

export default function ContentEditor() {
  const [activeTab, setActiveTab] = useState<'editor' | 'preview' | 'articles'>('editor');
  const [articles, setArticles] = useState([
    {
      id: 'A001',
      title: 'Getting Started with AVE',
      division: 'AVE',
      status: 'published' as const,
      createdDate: '2025-11-01',
      updatedDate: '2025-11-05',
      views: 1245
    },
    {
      id: 'A002',
      title: 'Wellness Tips for Better Health',
      division: 'Sakshi',
      status: 'draft' as const,
      createdDate: '2025-11-03',
      updatedDate: '2025-11-08',
      views: 0
    },
    {
      id: 'A003',
      title: 'Sustainable Fashion Guide',
      division: 'SubCircle',
      status: 'published' as const,
      createdDate: '2025-10-28',
      updatedDate: '2025-11-02',
      views: 2890
    },
  ]);

  const [editorState, setEditorState] = useState({
    title: '',
    division: 'General',
    excerpt: '',
    content: '',
    featuredImage: '',
    status: 'draft' as 'draft' | 'published',
    tags: '',
    seoTitle: '',
    seoDescription: '',
  });

  const [showImageUpload, setShowImageUpload] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setEditorState({
      ...editorState,
      [field]: value
    });
  };

  const insertMarkdown = (before: string, after: string = '') => {
    const textarea = document.getElementById('content-textarea') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = editorState.content.substring(start, end);
    const newContent = 
      editorState.content.substring(0, start) +
      before + selectedText + after +
      editorState.content.substring(end);

    setEditorState({
      ...editorState,
      content: newContent
    });
  };

  const publishArticle = () => {
    if (!editorState.title.trim()) {
      alert('Please enter a title');
      return;
    }
    if (!editorState.content.trim()) {
      alert('Please enter content');
      return;
    }

    const newArticle = {
      id: `A${Date.now()}`,
      title: editorState.title,
      division: editorState.division,
      status: 'published' as const,
      createdDate: new Date().toISOString().split('T')[0],
      updatedDate: new Date().toISOString().split('T')[0],
      views: 0
    };

    setArticles([newArticle, ...articles]);
    setEditorState({
      title: '',
      division: 'General',
      excerpt: '',
      content: '',
      featuredImage: '',
      status: 'draft',
      tags: '',
      seoTitle: '',
      seoDescription: '',
    });

    alert('Article published successfully!');
  };

  const saveAsDraft = () => {
    if (!editorState.title.trim()) {
      alert('Please enter a title');
      return;
    }

    alert('Article saved as draft!');
  };

  const deleteArticle = (id: string) => {
    setArticles(articles.filter(a => a.id !== id));
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-slate-900 py-8">
        <div className="container max-w-6xl">
          <div className="flex items-center gap-3 mb-2">
            <FileText className="w-8 h-8 text-purple-400" />
            <h1 className="text-4xl font-bold text-foreground">Content Editor</h1>
          </div>
          <p className="text-lg text-muted-foreground">Create and manage articles with rich text editing</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-border bg-slate-800">
        <div className="container max-w-6xl">
          <div className="flex gap-8">
            <button
              onClick={() => setActiveTab('editor')}
              className={`px-4 py-4 border-b-2 transition-colors flex items-center gap-2 ${
                activeTab === 'editor'
                  ? 'border-purple-400 text-purple-400'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <FileText className="w-5 h-5" />
              New Article
            </button>
            <button
              onClick={() => setActiveTab('preview')}
              className={`px-4 py-4 border-b-2 transition-colors flex items-center gap-2 ${
                activeTab === 'preview'
                  ? 'border-purple-400 text-purple-400'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <Eye className="w-5 h-5" />
              Preview
            </button>
            <button
              onClick={() => setActiveTab('articles')}
              className={`px-4 py-4 border-b-2 transition-colors flex items-center gap-2 ${
                activeTab === 'articles'
                  ? 'border-purple-400 text-purple-400'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              All Articles
              {articles.length > 0 && (
                <span className="bg-purple-600 text-white text-xs rounded-full px-2 py-0.5">
                  {articles.length}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container max-w-6xl py-8">
        {/* Editor Tab */}
        {activeTab === 'editor' && (
          <div className="space-y-6">
            {/* Article Metadata */}
            <Card className="bg-slate-800 border-slate-700 p-6">
              <h2 className="text-xl font-bold text-foreground mb-4">Article Details</h2>
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-muted-foreground block mb-2">Title *</label>
                  <Input
                    value={editorState.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="Enter article title"
                    className="bg-slate-700 border-slate-600 text-foreground"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-muted-foreground block mb-2">Division</label>
                    <select
                      value={editorState.division}
                      onChange={(e) => handleInputChange('division', e.target.value)}
                      className="w-full bg-slate-700 border border-slate-600 text-foreground rounded px-3 py-2"
                    >
                      <option>General</option>
                      <option>AVE</option>
                      <option>Sakshi</option>
                      <option>SubCircle</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground block mb-2">Status</label>
                    <select
                      value={editorState.status}
                      onChange={(e) => handleInputChange('status', e.target.value)}
                      className="w-full bg-slate-700 border border-slate-600 text-foreground rounded px-3 py-2"
                    >
                      <option value="draft">Draft</option>
                      <option value="published">Published</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-sm text-muted-foreground block mb-2">Excerpt</label>
                  <Textarea
                    value={editorState.excerpt}
                    onChange={(e) => handleInputChange('excerpt', e.target.value)}
                    placeholder="Brief summary of the article"
                    className="bg-slate-700 border-slate-600 text-foreground"
                    rows={2}
                  />
                </div>

                <div>
                  <label className="text-sm text-muted-foreground block mb-2">Tags</label>
                  <Input
                    value={editorState.tags}
                    onChange={(e) => handleInputChange('tags', e.target.value)}
                    placeholder="Separate tags with commas"
                    className="bg-slate-700 border-slate-600 text-foreground"
                  />
                </div>
              </div>
            </Card>

            {/* SEO Section */}
            <Card className="bg-slate-800 border-slate-700 p-6">
              <h2 className="text-xl font-bold text-foreground mb-4">SEO Settings</h2>
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-muted-foreground block mb-2">SEO Title</label>
                  <Input
                    value={editorState.seoTitle}
                    onChange={(e) => handleInputChange('seoTitle', e.target.value)}
                    placeholder="Optimized title for search engines"
                    className="bg-slate-700 border-slate-600 text-foreground"
                    maxLength={60}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {editorState.seoTitle.length}/60 characters
                  </p>
                </div>

                <div>
                  <label className="text-sm text-muted-foreground block mb-2">Meta Description</label>
                  <Textarea
                    value={editorState.seoDescription}
                    onChange={(e) => handleInputChange('seoDescription', e.target.value)}
                    placeholder="Description for search results"
                    className="bg-slate-700 border-slate-600 text-foreground"
                    rows={2}
                    maxLength={160}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {editorState.seoDescription.length}/160 characters
                  </p>
                </div>
              </div>
            </Card>

            {/* Rich Text Editor */}
            <Card className="bg-slate-800 border-slate-700 p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-foreground">Content *</h2>
                <button
                  onClick={() => setPreviewMode(!previewMode)}
                  className="text-purple-400 hover:text-purple-300 flex items-center gap-2"
                >
                  <Eye className="w-4 h-4" />
                  {previewMode ? 'Edit' : 'Preview'}
                </button>
              </div>

              {/* Toolbar */}
              <div className="bg-slate-700 rounded-t border border-slate-600 p-3 flex flex-wrap gap-2 mb-0">
                <button
                  onClick={() => insertMarkdown('**', '**')}
                  className="p-2 hover:bg-slate-600 rounded text-muted-foreground hover:text-foreground transition-colors"
                  title="Bold"
                >
                  <Bold className="w-4 h-4" />
                </button>
                <button
                  onClick={() => insertMarkdown('*', '*')}
                  className="p-2 hover:bg-slate-600 rounded text-muted-foreground hover:text-foreground transition-colors"
                  title="Italic"
                >
                  <Italic className="w-4 h-4" />
                </button>
                <button
                  onClick={() => insertMarkdown('~~', '~~')}
                  className="p-2 hover:bg-slate-600 rounded text-muted-foreground hover:text-foreground transition-colors"
                  title="Underline"
                >
                  <Underline className="w-4 h-4" />
                </button>

                <div className="w-px bg-slate-600 mx-1" />

                <button
                  onClick={() => insertMarkdown('## ', '')}
                  className="p-2 hover:bg-slate-600 rounded text-muted-foreground hover:text-foreground transition-colors"
                  title="Heading"
                >
                  <Heading2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => insertMarkdown('> ', '')}
                  className="p-2 hover:bg-slate-600 rounded text-muted-foreground hover:text-foreground transition-colors"
                  title="Quote"
                >
                  <Quote className="w-4 h-4" />
                </button>
                <button
                  onClick={() => insertMarkdown('- ', '')}
                  className="p-2 hover:bg-slate-600 rounded text-muted-foreground hover:text-foreground transition-colors"
                  title="List"
                >
                  <List className="w-4 h-4" />
                </button>

                <div className="w-px bg-slate-600 mx-1" />

                <button
                  onClick={() => insertMarkdown('[', '](url)')}
                  className="p-2 hover:bg-slate-600 rounded text-muted-foreground hover:text-foreground transition-colors"
                  title="Link"
                >
                  <Link className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setShowImageUpload(!showImageUpload)}
                  className="p-2 hover:bg-slate-600 rounded text-muted-foreground hover:text-foreground transition-colors"
                  title="Image"
                >
                  <Image className="w-4 h-4" />
                </button>
                <button
                  onClick={() => insertMarkdown('```\n', '\n```')}
                  className="p-2 hover:bg-slate-600 rounded text-muted-foreground hover:text-foreground transition-colors"
                  title="Code"
                >
                  <Code className="w-4 h-4" />
                </button>
              </div>

              {/* Image Upload */}
              {showImageUpload && (
                <div className="bg-slate-700 border border-t-0 border-slate-600 p-3 mb-0">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Paste image URL or upload"
                      className="bg-slate-600 border-slate-500 text-foreground"
                    />
                    <Button className="bg-purple-600 hover:bg-purple-700">Upload</Button>
                    <button
                      onClick={() => setShowImageUpload(false)}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )}

              {/* Editor/Preview */}
              {previewMode ? (
                <div className="bg-slate-700 border border-t-0 border-slate-600 rounded-b p-6 min-h-96 text-foreground prose prose-invert max-w-none">
                  <div className="whitespace-pre-wrap">{editorState.content || 'Preview will appear here...'}</div>
                </div>
              ) : (
                <Textarea
                  id="content-textarea"
                  value={editorState.content}
                  onChange={(e) => handleInputChange('content', e.target.value)}
                  placeholder="Write your article content here... Markdown is supported!"
                  className="bg-slate-700 border border-t-0 border-slate-600 text-foreground rounded-b min-h-96"
                  rows={15}
                />
              )}
            </Card>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <Button
                onClick={saveAsDraft}
                variant="outline"
                className="flex-1 text-purple-400 border-purple-400 hover:bg-purple-400/10"
              >
                <Clock className="w-4 h-4 mr-2" />
                Save as Draft
              </Button>
              <Button
                onClick={publishArticle}
                className="flex-1 bg-purple-600 hover:bg-purple-700"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Publish Article
              </Button>
            </div>
          </div>
        )}

        {/* Preview Tab */}
        {activeTab === 'preview' && (
          <Card className="bg-slate-800 border-slate-700 p-8">
            <div className="max-w-3xl mx-auto">
              <h1 className="text-4xl font-bold text-foreground mb-4">{editorState.title || 'Article Title'}</h1>
              <div className="flex gap-4 mb-6 text-sm text-muted-foreground">
                <span className="bg-slate-700 px-3 py-1 rounded">{editorState.division}</span>
                <span className="bg-slate-700 px-3 py-1 rounded capitalize">{editorState.status}</span>
              </div>
              {editorState.excerpt && (
                <p className="text-lg text-muted-foreground mb-6 italic">{editorState.excerpt}</p>
              )}
              <div className="prose prose-invert max-w-none text-foreground">
                <div className="whitespace-pre-wrap">{editorState.content || 'Content will appear here...'}</div>
              </div>
            </div>
          </Card>
        )}

        {/* Articles Tab */}
        {activeTab === 'articles' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-foreground">All Articles</h2>
              <Button className="bg-purple-600 hover:bg-purple-700">
                <Plus className="w-4 h-4 mr-2" />
                New Article
              </Button>
            </div>

            {articles.length === 0 ? (
              <Card className="bg-slate-800 border-slate-700 p-8 text-center">
                <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                <p className="text-muted-foreground">No articles yet</p>
              </Card>
            ) : (
              <div className="space-y-4">
                {articles.map(article => (
                  <Card key={article.id} className="bg-slate-800 border-slate-700 p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-foreground mb-2">{article.title}</h3>
                        <div className="flex gap-4 text-sm text-muted-foreground mb-3">
                          <span className="bg-slate-700 px-2 py-1 rounded">{article.division}</span>
                          <span className={`px-2 py-1 rounded ${
                            article.status === 'published'
                              ? 'bg-green-900 text-green-200'
                              : 'bg-yellow-900 text-yellow-200'
                          }`}>
                            {article.status}
                          </span>
                          <span>Updated: {article.updatedDate}</span>
                          <span>{article.views} views</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" className="text-purple-400 border-purple-400 hover:bg-purple-400/10">
                          Edit
                        </Button>
                        <Button
                          onClick={() => deleteArticle(article.id)}
                          variant="outline"
                          className="text-red-400 border-red-400 hover:bg-red-400/10"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
