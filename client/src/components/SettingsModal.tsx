import React, { useState } from 'react';
import { ApiSettings } from '../utils/api.js';
import { X, Settings, Key, ShieldCheck, Cpu, Check, AlertCircle } from 'lucide-react';

interface SettingsModalProps {
  settings: ApiSettings;
  onSave: (newSettings: ApiSettings) => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  settings,
  onSave,
  onClose,
}) => {
  const [localSettings, setLocalSettings] = useState<ApiSettings>(settings);
  const [showKey, setShowKey] = useState(false);
  const [savedNotice, setSavedNotice] = useState(false);

  const handleSave = () => {
    onSave(localSettings);
    setSavedNotice(true);
    setTimeout(() => {
      setSavedNotice(false);
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
              <Settings className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-200">Embedding Model & API Configuration</h3>
              <p className="text-xs text-slate-400">Choose between local zero-config or production APIs</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 text-xs">
          {/* Provider Radio Cards */}
          <div className="space-y-2">
            <label className="font-semibold text-slate-300 block">Select Embedding Provider:</label>
            <div className="space-y-2">
              <label
                onClick={() => setLocalSettings({ ...localSettings, provider: 'educational', model: 'educational-semantic-64' })}
                className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition ${
                  localSettings.provider === 'educational'
                    ? 'bg-cyan-950/40 border-cyan-500/60 ring-1 ring-cyan-500/30'
                    : 'bg-slate-950/40 border-slate-800 hover:border-slate-700'
                }`}
              >
                <input
                  type="radio"
                  name="provider"
                  checked={localSettings.provider === 'educational'}
                  onChange={() => {}}
                  className="mt-0.5 accent-cyan-500"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-200">Local Educational Vectorizer (64-D)</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 font-mono">
                      Recommended for learning
                    </span>
                  </div>
                  <p className="text-slate-400 mt-0.5">
                    100% offline, zero API keys required, instant responses. Calibrated 64-dimensional semantic concept space.
                  </p>
                </div>
              </label>

              <label
                onClick={() => setLocalSettings({ ...localSettings, provider: 'gemini', model: 'text-embedding-004' })}
                className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition ${
                  localSettings.provider === 'gemini'
                    ? 'bg-cyan-950/40 border-cyan-500/60 ring-1 ring-cyan-500/30'
                    : 'bg-slate-950/40 border-slate-800 hover:border-slate-700'
                }`}
              >
                <input
                  type="radio"
                  name="provider"
                  checked={localSettings.provider === 'gemini'}
                  onChange={() => {}}
                  className="mt-0.5 accent-cyan-500"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-200">Google Gemini API (768-D)</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-mono">
                      text-embedding-004
                    </span>
                  </div>
                  <p className="text-slate-400 mt-0.5">
                    State-of-the-art embedding model via Google Gemini REST API. Requires Gemini API Key.
                  </p>
                </div>
              </label>

              <label
                onClick={() => setLocalSettings({ ...localSettings, provider: 'openai', model: 'text-embedding-3-small' })}
                className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition ${
                  localSettings.provider === 'openai'
                    ? 'bg-cyan-950/40 border-cyan-500/60 ring-1 ring-cyan-500/30'
                    : 'bg-slate-950/40 border-slate-800 hover:border-slate-700'
                }`}
              >
                <input
                  type="radio"
                  name="provider"
                  checked={localSettings.provider === 'openai'}
                  onChange={() => {}}
                  className="mt-0.5 accent-cyan-500"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-200">OpenAI API (1536-D)</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 font-mono">
                      text-embedding-3-small
                    </span>
                  </div>
                  <p className="text-slate-400 mt-0.5">
                    Industry benchmark embeddings. Requires OpenAI API Key.
                  </p>
                </div>
              </label>

              <label
                onClick={() => setLocalSettings({ ...localSettings, provider: 'ollama', model: 'nomic-embed-text' })}
                className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition ${
                  localSettings.provider === 'ollama'
                    ? 'bg-cyan-950/40 border-cyan-500/60 ring-1 ring-cyan-500/30'
                    : 'bg-slate-950/40 border-slate-800 hover:border-slate-700'
                }`}
              >
                <input
                  type="radio"
                  name="provider"
                  checked={localSettings.provider === 'ollama'}
                  onChange={() => {}}
                  className="mt-0.5 accent-cyan-500"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-200">Ollama Local (e.g. nomic-embed-text)</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-mono">
                      localhost:11434
                    </span>
                  </div>
                  <p className="text-slate-400 mt-0.5">
                    Connects directly to your local Ollama server running locally on your machine.
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* API Key Field if using Gemini or OpenAI */}
          {(localSettings.provider === 'gemini' || localSettings.provider === 'openai') && (
            <div className="space-y-1.5 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
              <div className="flex items-center justify-between">
                <label className="font-medium text-slate-300 flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{localSettings.provider === 'gemini' ? 'Gemini API Key' : 'OpenAI API Key'}</span>
                </label>
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="text-[10px] text-cyan-400 hover:text-cyan-300"
                >
                  {showKey ? 'Hide' : 'Show'}
                </button>
              </div>

              <input
                type={showKey ? 'text' : 'password'}
                value={localSettings.apiKey || ''}
                onChange={(e) => setLocalSettings({ ...localSettings, apiKey: e.target.value })}
                placeholder={localSettings.provider === 'gemini' ? 'AIzaSy...' : 'sk-...'}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500"
              />

              <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mt-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Never saved to frontend code. Transmitted securely to the backend proxy.</span>
              </div>
            </div>
          )}

          {/* Ollama endpoint field */}
          {localSettings.provider === 'ollama' && (
            <div className="space-y-1.5 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
              <label className="font-medium text-slate-300">Ollama API Endpoint:</label>
              <input
                type="text"
                value={localSettings.endpoint || 'http://localhost:11434'}
                onChange={(e) => setLocalSettings({ ...localSettings, endpoint: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500"
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <span className="text-[11px] text-emerald-400 font-medium">
            {savedNotice ? '✓ Configuration Applied!' : ''}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shadow-md transition"
            >
              Save Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
