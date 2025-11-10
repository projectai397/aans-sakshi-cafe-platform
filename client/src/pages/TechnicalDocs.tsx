import React, { useState } from 'react';
import { Code2, Database, Server, Settings, Brain, Network } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function TechnicalDocs() {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const sections = [
    {
      id: 'architecture',
      title: 'Platform Architecture',
      icon: 'GitNetwork',
      content: 'Microservices architecture with 3 independent divisions (AVE, Sakshi, SubCircle) sharing common infrastructure services.',
      subsections: [
        'High-Level Architecture Overview',
        'System Components',
        'API-First Design',
        'Event-Driven Communication',
      ],
    },
    {
      id: 'frontend',
      title: 'Frontend Technologies',
      icon: 'Code2',
      content: 'React 18+ with TypeScript, Material-UI, Redux Toolkit, and modern web technologies.',
      subsections: [
        'React Framework',
        'State Management',
        'UI Components',
        'Data Visualization',
        'Testing & QA',
      ],
    },
    {
      id: 'backend',
      title: 'Backend Technologies',
      icon: 'Server',
      content: 'Python FastAPI for AI services, Node.js Express for web services, with comprehensive API documentation.',
      subsections: [
        'FastAPI (Python)',
        'Express.js (Node.js)',
        'ORM & Database',
        'Authentication & Security',
        'API Documentation',
      ],
    },
    {
      id: 'database',
      title: 'Database & Storage',
      icon: 'Database',
      content: 'PostgreSQL for relational data, Redis for caching, MongoDB for unstructured data, S3 for file storage.',
      subsections: [
        'PostgreSQL 15+',
        'Redis Caching',
        'MongoDB',
        'Object Storage (S3)',
        'Search Engines',
      ],
    },
    {
      id: 'aiml',
      title: 'AI/ML Technologies',
      icon: 'Brain',
      content: 'scikit-learn, PyTorch, TensorFlow, Hugging Face Transformers, and Prophet for advanced analytics.',
      subsections: [
        'Machine Learning',
        'Deep Learning',
        'NLP & Transformers',
        'Time Series Forecasting',
        'Computer Vision',
      ],
    },
    {
      id: 'devops',
      title: 'DevOps & Infrastructure',
      icon: 'Settings',
      content: 'Docker, Kubernetes, GitHub Actions, Terraform, with comprehensive monitoring and logging.',
      subsections: [
        'Containerization',
        'Orchestration',
        'CI/CD Pipelines',
        'Infrastructure as Code',
        'Monitoring & Logging',
      ],
    },
  ];

  const toggleSection = (id: string) => {
    setExpandedSection(expandedSection === id ? null : id);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-slate-900 py-12">
        <div className="container max-w-4xl">
          <h1 className="text-4xl font-bold text-foreground mb-2">Technical Documentation</h1>
          <p className="text-lg text-muted-foreground">Complete architecture and technology stack</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="container max-w-4xl py-12">
        {/* Overview */}
        <Card className="mb-8 p-6 bg-slate-800 border-slate-700">
          <h2 className="text-2xl font-bold text-foreground mb-4">Platform Overview</h2>
          <p className="text-muted-foreground mb-6">
            AANS is built on a modern, scalable microservices architecture using open-source, MIT-licensed tools. The platform consists of three independent divisions (AVE, Sakshi, SubCircle) sharing common infrastructure services.
          </p>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-slate-700 rounded-lg p-4 text-center border border-slate-600">
              <div className="text-3xl font-bold text-cyan-400 mb-2">3</div>
              <div className="text-sm text-muted-foreground">Divisions</div>
            </div>
            <div className="bg-slate-700 rounded-lg p-4 text-center border border-slate-600">
              <div className="text-3xl font-bold text-cyan-400 mb-2">50+</div>
              <div className="text-sm text-muted-foreground">Technologies</div>
            </div>
            <div className="bg-slate-700 rounded-lg p-4 text-center border border-slate-600">
              <div className="text-3xl font-bold text-cyan-400 mb-2">100%</div>
              <div className="text-sm text-muted-foreground">Open Source</div>
            </div>
          </div>
        </Card>

        {/* Technology Sections */}
        <div className="space-y-4 mb-8">
          {sections.map((section) => (
            <div key={section.id}>
              <button
                onClick={() => toggleSection(section.id)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-4 hover:bg-slate-700 transition-colors text-left"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="text-cyan-400 mt-1">
                      {section.icon === 'GitNetwork' && <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/></svg>}
                      {section.icon === 'Code2' && <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M9.4 16.6L4.8 12l4.6-4.6L6.6 6 0 12l6.6 6 2.8-2.4zm5.2 0l4.6-4.6-4.6-4.6 2.8-2.8L24 12l-6.6 6 2.8 2.4z"/></svg>}
                      {section.icon === 'Server' && <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M20 13H4c-.55 0-1 .45-1 1v6c0 .55.45 1 1 1h16c.55 0 1-.45 1-1v-6c0-.55-.45-1-1-1zm0-10H4c-.55 0-1 .45-1 1v6c0 .55.45 1 1 1h16c.55 0 1-.45 1-1V4c0-.55-.45-1-1-1z"/></svg>}
                      {section.icon === 'Database' && <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 5.58 2 10v10c0 4.42 4.48 8 10 8s10-3.58 10-8V10c0-4.42-4.48-8-10-8zm0 2c4.42 0 8 2.69 8 6s-3.58 6-8 6-8-2.69-8-6 3.58-6 8-6z"/></svg>}
                      {section.icon === 'Brain' && <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/></svg>}
                      {section.icon === 'Settings' && <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.62l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.48.1.62l2.03 1.58c-.05.3-.07.62-.07.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.62l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.48-.1-.62l-2.03-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/></svg>}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-foreground mb-1">{section.title}</h3>
                      <p className="text-sm text-muted-foreground">{section.content}</p>
                    </div>
                  </div>
                  <svg className={`w-6 h-6 text-cyan-400 transition-transform ${expandedSection === section.id ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                </div>
              </button>

              {expandedSection === section.id && (
                <div className="bg-slate-900 border-l-2 border-cyan-400 p-4 mt-2 rounded">
                  {section.subsections.map((subsection, idx) => (
                    <div key={idx} className="flex items-center gap-3 mb-3 last:mb-0">
                      <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/></svg>
                      <span className="text-muted-foreground text-sm">{subsection}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Key Features */}
        <Card className="mb-8 p-6 bg-slate-800 border-slate-700">
          <h2 className="text-2xl font-bold text-foreground mb-6">Key Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { title: 'Enterprise Security', desc: 'OAuth 2.0, JWT, encrypted data' },
              { title: 'High Performance', desc: 'Redis caching, CDN, optimization' },
              { title: 'Scalable', desc: 'Kubernetes, horizontal scaling' },
              { title: 'Analytics', desc: 'Real-time metrics, dashboards' },
              { title: 'Real-time', desc: 'WebSockets, event-driven' },
              { title: 'Cloud Native', desc: 'Docker, AWS, serverless' },
            ].map((feature, idx) => (
              <div key={idx} className="flex gap-4">
                <div className="w-10 h-10 rounded-lg bg-slate-700 flex items-center justify-center flex-shrink-0 text-cyan-400">
                  {idx === 0 && <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/></svg>}
                  {idx === 1 && <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>}
                  {idx === 2 && <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11z"/></svg>}
                  {idx === 3 && <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/></svg>}
                  {idx === 4 && <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/></svg>}
                  {idx === 5 && <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96z"/></svg>}
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-1">{feature.title}</h4>
                  <p className="text-sm text-muted-foreground">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Deployment */}
        <Card className="p-6 bg-slate-800 border-slate-700">
          <h2 className="text-2xl font-bold text-foreground mb-4">Deployment Architecture</h2>
          <div className="space-y-3 text-sm">
            <div>
              <span className="font-semibold text-foreground">Cloud Provider:</span>
              <span className="text-muted-foreground ml-2">AWS (EC2, RDS, S3, Lambda, CloudFront)</span>
            </div>
            <div>
              <span className="font-semibold text-foreground">Containerization:</span>
              <span className="text-muted-foreground ml-2">Docker with Kubernetes orchestration</span>
            </div>
            <div>
              <span className="font-semibold text-foreground">CI/CD:</span>
              <span className="text-muted-foreground ml-2">GitHub Actions with automated testing and deployment</span>
            </div>
            <div>
              <span className="font-semibold text-foreground">Infrastructure:</span>
              <span className="text-muted-foreground ml-2">Terraform for Infrastructure as Code</span>
            </div>
            <div>
              <span className="font-semibold text-foreground">Monitoring:</span>
              <span className="text-muted-foreground ml-2">Prometheus + Grafana for metrics and alerts</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
