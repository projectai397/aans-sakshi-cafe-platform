import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import Analytics from "./pages/Analytics";
import TechnicalDocs from "./pages/TechnicalDocs";
import AVEAIModule from "./pages/AVEAIModule";
import SakshiEcosystem from "./pages/SakshiEcosystem";
import SubCircleMarketplace from "./pages/SubCircleMarketplace";
import NotificationCenter from "./pages/NotificationCenter";
import ContentEditor from "./pages/ContentEditor";
import SakshiCheckout from "./pages/SakshiCheckout";
import SubCircleCheckout from "@/pages/SubCircleCheckout";
import PaymentHistory from "@/pages/PaymentHistory";
import UserDashboard from "@/pages/UserDashboard";
import EmailNotifications from "@/pages/EmailNotifications";
import AdvancedSearch from "@/pages/AdvancedSearch";
import ReferralProgram from "@/pages/ReferralProgram";
import SocialSharing from "@/pages/SocialSharing";
import RecommendationEngine from "@/pages/RecommendationEngine";
import Gamification from "./pages/Gamification";
import SakshiAnalyticsDashboard from "./pages/sakshi/analytics/Dashboard";
import SakshiRevenueAnalytics from "./pages/sakshi/analytics/RevenueAnalytics";
import SakshiCustomerAnalytics from "./pages/sakshi/analytics/CustomerAnalytics";
import SakshiMenuPerformance from "./pages/sakshi/analytics/MenuPerformance";
import AVEDashboard from "./pages/ave/AVEDashboard";
import AVEAnalytics from "./pages/ave/AVEAnalytics";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { PWAInstallPrompt } from "./components/PWAInstallPrompt";
import { PWAUpdateNotification } from "./components/PWAUpdateNotification";
import Home from "./pages/Home";
import AVE from "./pages/AVE";
import Sakshi from "./pages/Sakshi";
import SubCircle from "./pages/SubCircle";
import Blog from "./pages/Blog";
import BlogArticle from "./pages/BlogArticle";
import Admin from "./pages/Admin";
import CompanyHome from "./pages/CompanyHome";
import AboutUs from "./pages/AboutUs";
import Management from "./pages/Management";
import Finance from "./pages/Finance";
import Marketing from "./pages/Marketing";
import Operations from "./pages/Operations";
import Compliance from "./pages/Compliance";
import NewsCareerContact from "./pages/NewsCareerContact";
import Portal from "./pages/Portal";
import NotFound from "./pages/NotFound";

function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/ave"} component={AVE} />
      <Route path={"/sakshi"} component={Sakshi} />
      <Route path={"/subcircle"} component={SubCircle} />
      <Route path={"/blog"} component={Blog} />
      <Route path={"/blog/:slug"} component={BlogArticle} />
      <Route path={"/admin"} component={Admin} />
      <Route path={"/company"} component={CompanyHome} />
      <Route path={"/company/about"} component={AboutUs} />
      <Route path={"/company/management"} component={Management} />
      <Route path={"/company/finance"} component={Finance} />
      <Route path={"/company/marketing"} component={Marketing} />
      <Route path={"/company/operations"} component={Operations} />
      <Route path={"/company/compliance"} component={Compliance} />
      <Route path={"/company/news"} component={NewsCareerContact} />
      <Route path={"/company/careers"} component={NewsCareerContact} />
      <Route path={"/company/contact"} component={NewsCareerContact} />
      <Route path={"/portal"} component={Portal} />
      <Route path={"/analytics"} component={Analytics} />
      <Route path={"/technical-docs"} component={TechnicalDocs} />
      <Route path={"/ave/ai-module"} component={AVEAIModule} />
      <Route path={"/sakshi/ecosystem"} component={SakshiEcosystem} />
      <Route path={"/subcircle/marketplace"} component={SubCircleMarketplace} />
      <Route path={"/notifications"} component={NotificationCenter} />
      <Route path={"/content-editor"} component={ContentEditor} />
      <Route path={"/sakshi/checkout"} component={SakshiCheckout} />
      <Route path={"/subcircle/checkout"} component={SubCircleCheckout} />
       <Route path="/payment-history" component={PaymentHistory} />
      <Route path="/dashboard" component={UserDashboard} />
      <Route path="/email-notifications" component={EmailNotifications} />
      <Route path="/search" component={AdvancedSearch} />
      <Route path="/referral" component={ReferralProgram} />
      <Route path="/social-sharing" component={SocialSharing} />
      <Route path="/recommendations" component={RecommendationEngine} />
      <Route path="/gamification" component={Gamification} />
      <Route path="/sakshi/analytics/dashboard" component={SakshiAnalyticsDashboard} />
      <Route path="/sakshi/analytics/revenue" component={SakshiRevenueAnalytics} />
      <Route path="/sakshi/analytics/customers" component={SakshiCustomerAnalytics} />
      <Route path="/sakshi/analytics/menu" component={SakshiMenuPerformance} />
      <Route path="/ave/dashboard" component={AVEDashboard} />
      <Route path="/ave/analytics" component={AVEAnalytics} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="dark"
        // switchable
      >
        <TooltipProvider>
          <Toaster />
          <Router />
          <PWAInstallPrompt />
          <PWAUpdateNotification />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
