const fs = require('fs');
let code = fs.readFileSync('src/pages/SignUpPage.tsx', 'utf8');

const targetValidation = `if (!formData.orgName.trim()) return setError('اسم المغسلة / الشركة مطلوب');`;
const replacementValidation = `
    const isEnglishDigits = (str: string) => /^[0-9]*$/.test(str);
    const toEnglishDigits = (str: string) => str.replace(/[٠-٩]/g, d => "٠١٢٣٤٥٦٧٨٩".indexOf(d).toString());

    if (!formData.orgName.trim()) return setError('اسم المغسلة / الشركة مطلوب');
    
    // Password validation
    if (formData.password !== formData.confirmPassword) {
      return setError('كلمتا المرور غير متطابقتين');
    }
    const pwd = formData.password;
    if (pwd.length < 9 || !/[A-Z]/.test(pwd) || !/[a-z]/.test(pwd) || !/[0-9]/.test(pwd) || !/[^A-Za-z0-9]/.test(pwd)) {
      return setError('كلمة المرور ضعيفة. يجب أن تحتوي على 9 أحرف على الأقل، حرف كبير، حرف صغير، رقم، ورمز.');
    }
`;
code = code.replace(targetValidation, replacementValidation);

const targetPwdField = `const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {`;
const replacementPwdField = `const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // force english digits for phone/numbers if needed
    if (e.target.name === 'userPhone') {
       e.target.value = e.target.value.replace(/[٠-٩]/g, d => "٠١٢٣٤٥٦٧٨٩".indexOf(d).toString());
    }
`;
code = code.replace(targetPwdField, replacementPwdField);

// also add confirmPassword to the state
code = code.replace(/const \[formData, setFormData\] = useState\(\{/, "const [formData, setFormData] = useState({\n    confirmPassword: '',");
code = code.replace(/<div className="relative">\s*<Lock className="w-5 h-5 absolute right-3 top-1\/2 -translate-y-1\/2 text-surface-400" \/>\s*<Input\s*name="password"[\s\S]*?<\/div>/, 
`$&
<div className="relative mt-4">
  <Lock className="w-5 h-5 absolute right-3 top-1/2 -translate-y-1/2 text-surface-400" />
  <Input
    name="confirmPassword"
    type="password"
    placeholder="تأكيد كلمة المرور"
    value={formData.confirmPassword}
    onChange={handleChange}
    className="pr-10"
    required
  />
</div>
<div className="mt-2 text-xs text-surface-500 flex gap-2 flex-wrap">
  <span className={formData.password.length >= 9 ? 'text-emerald-500' : ''}>9+ أحرف</span>
  <span className={/[A-Z]/.test(formData.password) ? 'text-emerald-500' : ''}>حرف كبير</span>
  <span className={/[a-z]/.test(formData.password) ? 'text-emerald-500' : ''}>حرف صغير</span>
  <span className={/[0-9]/.test(formData.password) ? 'text-emerald-500' : ''}>رقم</span>
  <span className={/[^A-Za-z0-9]/.test(formData.password) ? 'text-emerald-500' : ''}>رمز</span>
</div>`);

fs.writeFileSync('src/pages/SignUpPage.tsx', code);
