import React, { useState } from 'react';
import { Check, Code2, Copy, Download, FileCode, Layers, Terminal } from 'lucide-react';
import { FLUTTER_DART_CODEBASE, FlutterCodeFile } from '../data/flutterExportCode';

export const FlutterCodePackageView: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<FlutterCodeFile>(FLUTTER_DART_CODEBASE[0]);
  const [copied, setCopied] = useState(false);

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownloadFile = (file: FlutterCodeFile) => {
    const blob = new Blob([file.code], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = file.path.split('/').pop() || 'file.dart';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Informative Header regarding Flutter & Dart */}
      <div className="bg-white rounded-xl border border-[#DCE5E9] p-5 shadow-sm space-y-3">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
          <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-200 text-[#0F766E] flex items-center justify-center font-bold">
            <Code2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">
              حزمة كود Flutter & Dart المرجعية (Architecture Packages)
            </h2>
            <p className="text-xs text-slate-500">
              بناءً على طلبك واستناداً إلى وثيقة المواصفات SRS (المادة REQ-PLAT-001)، تتوفر هنا حزم Dart النظيفة لتطبيق Windows و Android.
            </p>
          </div>
        </div>

        <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs text-slate-700 leading-relaxed">
          <p className="font-semibold text-slate-900 mb-1">
            ملاحظة بيئة التشغيل والمعمارية المعتمدة:
          </p>
          <p>
            تعمل الواجهة التفاعلية الحالية في متصفحك عبر React و TypeScript لتوفير معاينة فورية حية، بينما تم إعداد وتوثيق كافة حزم كود <strong>Flutter & Dart</strong> الأصلية أدناه (المخطط السني عبر <code>CustomPainter</code>، قاعدة بيانات <code>Drift + SQLite3MC</code> المشفرة محلياً، وبروتوكول المزامنة الموقع). يمكنك تصفح هذه الملفات ونسخها أو تصديرها فوراً.
          </p>
        </div>
      </div>

      {/* Code Browser Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Files Tree (Left 4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-xl border border-[#DCE5E9] p-4 shadow-sm space-y-2">
          <h3 className="text-xs font-bold text-slate-700 border-b border-slate-100 pb-2 flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-[#0F766E]" />
            <span>ملفات حزمة Dart & Flutter:</span>
          </h3>

          <div className="space-y-1.5">
            {FLUTTER_DART_CODEBASE.map(file => {
              const isSelected = selectedFile.path === file.path;
              return (
                <button
                  key={file.path}
                  type="button"
                  onClick={() => setSelectedFile(file)}
                  className={`w-full text-right p-2.5 rounded-lg border text-xs transition-all ${
                    isSelected 
                      ? 'border-[#0F766E] bg-[#E7F5F3] shadow-xs' 
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-mono text-[11px] text-slate-800 truncate" dir="ltr">
                    <FileCode className="w-3.5 h-3.5 text-teal-700 shrink-0" />
                    <span className="truncate">{file.path.split('/').pop()}</span>
                  </div>
                  <div className="text-[10px] text-slate-500 mt-1 truncate">
                    {file.description_ar}
                  </div>
                  <div className="text-[9px] font-mono text-teal-800 bg-teal-50 px-1.5 py-0.2 rounded inline-block mt-1">
                    {file.category}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Code Viewer Panel (Right 8 cols) */}
        <div className="lg:col-span-8 bg-slate-900 rounded-xl border border-slate-800 shadow-lg overflow-hidden text-slate-200">
          {/* Code Viewer Header */}
          <div className="p-3.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
            <div className="min-w-0 font-mono text-xs text-teal-400 truncate" dir="ltr">
              {selectedFile.path}
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => handleCopy(selectedFile.code)}
                className="flex items-center gap-1 text-xs px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'تم النسخ!' : 'نسخ الكود'}</span>
              </button>

              <button
                type="button"
                onClick={() => handleDownloadFile(selectedFile)}
                className="flex items-center gap-1 text-xs px-2.5 py-1 rounded bg-[#0F766E] hover:bg-[#0d6861] text-white transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>تنزيل الملف (.dart)</span>
              </button>
            </div>
          </div>

          {/* Code Body */}
          <div className="p-4 overflow-x-auto max-h-[600px] text-xs font-mono leading-relaxed" dir="ltr">
            <pre className="text-slate-300">
              <code>{selectedFile.code}</code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
