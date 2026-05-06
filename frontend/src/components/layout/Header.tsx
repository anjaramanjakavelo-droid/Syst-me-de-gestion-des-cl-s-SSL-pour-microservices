interface HeaderProps {
  subtitle?: string;
}

const Header = ({ subtitle }: HeaderProps) => {
  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Système de gestion des clés SSL pour microservices</h1>
        {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
      </div>
    </header>
  );
};

export default Header;
