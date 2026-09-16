import React from 'react';
import { createRoot } from 'react-dom/client';
import 'beds/styles.css';
import Catalog from './Catalog';
import LucyPage from './LucyPage';
import McpPage from './McpPage';
import DisclosuresPage from './DisclosuresPage';
import OtpPage from './OtpPage';
import PagedCarouselPage from './PagedCarouselPage';
import ToastPage from './ToastPage';
import ConversationPage from './ConversationPage';
import ApplicationCardPage from './ApplicationCardPage';
import SettingsFormPage from './SettingsFormPage';
import SettingsPage from './SettingsPage';
import SearchDialogPage from './SearchDialogPage';
import DrawerPage from './DrawerPage';
import OnboardingPage from './OnboardingPage';
import AccountCreditsPage from './AccountCreditsPage';
import ForumTopicPage from './ForumTopicPage';
import UploadPage from './UploadPage';
import DateItemPage from './DateItemPage';
import PaymentConfirmationPage from './PaymentConfirmationPage';
import BlogPostPage from './BlogPostPage';
import KanbanPage from './KanbanPage';
import LandingFooterPage from './LandingFooterPage';
import BenefitsPage from './BenefitsPage';
const params = new URLSearchParams(location.search);
const pages: Record<string, React.ComponentType> = {
  benefits: BenefitsPage,
  'landing-footer': LandingFooterPage,
  kanban: KanbanPage,
  'blog-post': BlogPostPage,
  'payment-confirmation': PaymentConfirmationPage,
  upload: UploadPage,
  'date-item': DateItemPage,
  forum: ForumTopicPage,
  'account-credits': AccountCreditsPage,
  onboarding: OnboardingPage,
  drawer: DrawerPage,
  search: SearchDialogPage,
  'settings-form': SettingsFormPage,
  settings: SettingsPage,
  'application-card': ApplicationCardPage,
  conversation: ConversationPage,
  toast: ToastPage,
  'paged-carousel': PagedCarouselPage,
  otp: OtpPage,
  disclosures: DisclosuresPage,
  mcp: McpPage,
  lucy: LucyPage,
};
const requestedView = params.get('view') ?? 'components';
const view = requestedView === 'home' && params.get('tab') === 'lucy' ? 'lucy' : requestedView;
const Page = Object.hasOwn(pages, view) ? pages[view] : Catalog;
createRoot(document.getElementById('root')!).render(<React.StrictMode><Page /></React.StrictMode>);
