const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const target = `  const [active, setActive] = useState<ModuleKey>('dashboard');`;
const replacement = `  const [active, setActive] = useState<ModuleKey>('dashboard');
  const [isPending, startTransition] = React.useTransition();
  const handleNav = (key: ModuleKey) => {
    startTransition(() => {
      setActive(key);
    });
  };`;
code = code.replace(target, replacement);

const target2 = `onNavigate={setActive}`;
const replacement2 = `onNavigate={handleNav}`;
code = code.replace(target2, replacement2);

fs.writeFileSync('src/App.tsx', code);
