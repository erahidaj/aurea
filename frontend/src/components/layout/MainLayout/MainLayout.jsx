import Header from "../Header/Header";
import Footer from "../Footer/Footer";
import WhatsAppButton from "../../common/WhatsAppButton/WhatsAppButton";
const MainLayout = ({ children }) => {
  return (
    <>
      <Header />
      <main>{children}</main>
      <Footer />
      <WhatsAppButton />
    </>
  );
};

export default MainLayout;
