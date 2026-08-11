const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const target = `  const [active, setActive] = useState<ModuleKey>('dashboard');
  const [isPending, startTransition] = React.useTransition();
  const handleNav = (key: ModuleKey) => {
    startTransition(() => {
      setActive(key);
    });
  };`;
const replacement = `  const [active, setActive] = useState<ModuleKey>('dashboard');
  const handleNav = (key: ModuleKey) => {
    React.startTransition(() => {
      setActive(key);
    });
  };`;
code = code.replace(target, replacement);

fs.writeFileSync('src/App.tsx', code);
