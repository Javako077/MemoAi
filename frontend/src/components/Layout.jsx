import Sidebar from './Sidebar';
import AIVoiceAssistant from './AIVoiceAssistant';

export default function Layout({ children }) {
  return (
    <div className="flex min-h-screen bg-slate-900 text-white relative">
      <Sidebar />
      <main className="flex-1 transition-all duration-300 ml-20 md:ml-64 p-6 md:p-12">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>
      <AIVoiceAssistant />
    </div>
  );
}
