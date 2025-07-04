import Footer from "@/components/Footer"
import Header from "@/components/Header"
import ShippingInformationForm from "@/components/ShippingInformationForm"

export const SettingsPage = () => {
  return (
    <div>
      <Header />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Settings</h1>
        <div className="flex">
          <div className="lg:w-1/2 sm:w-full pr-4">
            <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
              <h2 className="text-2xl font-semibold mb-4">
                Shipping Information
              </h2>
              <ShippingInformationForm />
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}
