import React from 'react';
import { createRoot } from 'react-dom/client';
import 'beds/styles.css';
import Catalog from './Catalog';
import AiChatPage from './AiChatPage';
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
import LandingPage from './LandingPage';
import ProcessingPage from './ProcessingPage';
import ResultsPage from './ResultsPage';
import CheckoutPage from './CheckoutPage';
import AnimatedNumberPage from './AnimatedNumberPage';
import HandDrawnArrowPage from './HandDrawnArrowPage';
import ExpandingButtonPage from './ExpandingButtonPage';
import ResultPatternsPage from './ResultPatternsPage';
import EditingPage from './EditingPage';
import CommercePage from './CommercePage';
import DocumentEditorPage from './DocumentEditorPage';
const params = new URLSearchParams(location.search);
const pages: Record<string, React.ComponentType> = {
  checkout: CheckoutPage,
  'animated-number': AnimatedNumberPage,
  'hand-drawn-arrow': HandDrawnArrowPage,
  'expanding-button': ExpandingButtonPage,
  'result-patterns': ResultPatternsPage,
  editing: EditingPage,
  commerce: CommercePage,
  'document-editor': DocumentEditorPage,
  'analysis-result': () => <ResultsPage mode="analysis" />,
  'optimization-result': () => <ResultsPage mode="optimization" />,
  'analysis-loading': ProcessingPage,
  'optimization-loading': ProcessingPage,
  landing: LandingPage,
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
  'ai-chat': AiChatPage,
};
const requestedView = params.get('view') ?? 'components';
const view = requestedView === 'home' && params.get('tab') === 'ai-chat' ? 'ai-chat' : requestedView;
const Page = Object.hasOwn(pages, view) ? pages[view] : Catalog;
createRoot(document.getElementById('root')!).render(<React.StrictMode><Page /></React.StrictMode>);
