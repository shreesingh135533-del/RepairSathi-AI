import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import AuthModal from './components/AuthModal';

import Home from './pages/Home';
import Assistant from './pages/Assistant';
import RepairCosts from './pages/RepairCosts';
import KnowledgeBase from './pages/KnowledgeBase';
import SafetyGuide from './pages/SafetyGuide';
import History from './pages/History';
import AdminDashboard from './pages/AdminDashboard';

function MainApp() {
  const getInitialPage = () => {
    const params = new URLSearchParams(window.location.search);
    const p = params.get('page') || window.location.hash.replace('#', '');
    if (['home', 'assistant', 'costs', 'knowledge', 'safety', 'history', 'admin'].includes(p)) {
      return p;
    }
    return 'home';
  };

  const [activePage, setActivePage] = useState(getInitialPage);
  const [assistantInitialData, setAssistantInitialData] = useState(null);
  const [costsInitialData, setCostsInitialData] = useState(null);
  const { user } = useAuth();

  // Navigation handlers
  const handleStartDiagnosis = (data = null) => {
    setAssistantInitialData(data);
    setActivePage('assistant');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigateCost = (costFilters = null) => {
    setCostsInitialData(costFilters);
    setActivePage('costs');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectCategory = (categorySlug) => {
    if (categorySlug === 'safety') {
      setActivePage('safety');
    } else if (categorySlug === 'knowledge') {
      setActivePage('knowledge');
    } else if (categorySlug === 'costs') {
      setActivePage('costs');
    } else {
      setAssistantInitialData({ category: categorySlug });
      setActivePage('assistant');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDiagnoseArticle = (articleData) => {
    setAssistantInitialData(articleData);
    setActivePage('assistant');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleResumeConversation = async (conversationId) => {
    try {
      const res = await fetch(`/api/repair/conversations/${conversationId}`);
      const data = await res.json();
      if (data.conversation) {
        setAssistantInitialData({
          category: data.conversation.category_slug,
          deviceName: data.conversation.device_name,
          model: data.conversation.model,
          errorCode: data.conversation.error_code,
          problemDescription: data.conversation.problem_description,
          existingConversationId: conversationId
        });
        setActivePage('assistant');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (err) {
      console.error('Failed to resume conversation', err);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#fafafa] dark:bg-[#090a0f] text-slate-800 dark:text-slate-100 transition-colors font-sans selection:bg-blue-600 selection:text-white">
      <Navbar activePage={activePage} setActivePage={setActivePage} />

      <main className="flex-1">
        {activePage === 'home' && (
          <Home
            onStartDiagnosis={handleStartDiagnosis}
            onSelectCategory={handleSelectCategory}
            onNavigateCost={handleNavigateCost}
          />
        )}

        {activePage === 'assistant' && (
          <Assistant
            initialData={assistantInitialData}
            onNavigateCost={handleNavigateCost}
            key={assistantInitialData ? JSON.stringify(assistantInitialData) : 'fresh'}
          />
        )}

        {activePage === 'costs' && (
          <RepairCosts
            initialFilters={costsInitialData}
            onStartDiagnosis={handleStartDiagnosis}
            key={costsInitialData ? JSON.stringify(costsInitialData) : 'default-costs'}
          />
        )}

        {activePage === 'knowledge' && (
          <KnowledgeBase onDiagnoseArticle={handleDiagnoseArticle} />
        )}

        {activePage === 'safety' && (
          <SafetyGuide onStartDiagnosis={handleStartDiagnosis} />
        )}

        {activePage === 'history' && (
          <History onResumeConversation={handleResumeConversation} />
        )}

        {activePage === 'admin' && (
          user?.role === 'admin' ? (
            <AdminDashboard />
          ) : (
            <div className="max-w-md mx-auto my-20 p-8 text-center bg-white dark:bg-charcoal-900 rounded-3xl border border-slate-200 dark:border-white/[0.08]">
              <p className="font-heading font-bold text-red-500 mb-2">Access Denied</p>
              <p className="text-sm text-slate-500 font-sans">You must be logged in as an Administrator to view this control panel.</p>
            </div>
          )
        )}
      </main>

      <Footer onNavigate={setActivePage} />
      <AuthModal />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
