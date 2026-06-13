
const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-200 py-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <p className="text-gray-500 text-sm">
          © {new Date().getFullYear()} CerVer - Certificate Verification System
        </p>
        <p className="text-gray-400 text-xs mt-2">
          Secure digital certificates with blockchain verification
        </p>
      </div>
    </footer>
  );
};

export default Footer;