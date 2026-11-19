import { BrowserRouter, Route, Routes } from "react-router-dom";
import { I18nProvider } from "@/i18n";
import { QuoteProvider } from "@/state/quote";
import { ToastProvider } from "@/state/toast";
import { Layout } from "@/components/Layout";
import Home from "@/pages/Home";
import Catalogue from "@/pages/Catalogue";
import { CategoriesIndex, CategoryPage } from "@/pages/Categories";
import { BrandsDirectory, BrandPage } from "@/pages/Brands";
import ProductPage from "@/pages/Product";
import QuoteList from "@/pages/QuoteList";
import QuoteRequest from "@/pages/QuoteRequest";
import QuoteConfirmation from "@/pages/QuoteConfirmation";
import About from "@/pages/About";
import Contact from "@/pages/Contact";
import Faq from "@/pages/Faq";
import NotFound from "@/pages/NotFound";
import Admin from "@/pages/Admin";

/**
 * Browser routing gives each catalogue page a clean, shareable URL. Vercel's
 * rewrite configuration serves the SPA entry point for direct page requests.
 */
export default function App() {
  return (
    <BrowserRouter>
      <I18nProvider>
        <ToastProvider>
          <QuoteProvider>
            <Routes>
              <Route path="admin" element={<Admin />} />
              <Route element={<Layout />}>
                <Route index element={<Home />} />
                <Route path="catalogue" element={<Catalogue />} />
                <Route path="categories" element={<CategoriesIndex />} />
                <Route path="category/:slug" element={<CategoryPage />} />
                <Route path="brands" element={<BrandsDirectory />} />
                <Route path="brand/:slug" element={<BrandPage />} />
                <Route path="product/:id" element={<ProductPage />} />
                <Route path="quote" element={<QuoteList />} />
                <Route path="quote/request" element={<QuoteRequest />} />
                <Route path="quote/confirmation/:ref" element={<QuoteConfirmation />} />
                <Route path="about" element={<About />} />
                <Route path="contact" element={<Contact />} />
                <Route path="faq" element={<Faq />} />
                <Route path="*" element={<NotFound />} />
              </Route>
            </Routes>
          </QuoteProvider>
        </ToastProvider>
      </I18nProvider>
    </BrowserRouter>
  );
}
