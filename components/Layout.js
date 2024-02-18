import { useAuth } from "../pages/lib/firebase"
import Navbar from "./Navbar"
import Footer from "./Footer"

const Layout = ({ children }) => {
  const { user } = useAuth()

  return (
    <div>
      <Navbar user={user} />
      <div className="container mx-auto">{children}</div>
      <Footer />
    </div>
  )
}

export default Layout
