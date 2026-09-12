// يضبط data-theme على <html> قبل الرسم الأول لمنع وميض اللون (FOUC)،
// بقراءة تفضيل المستخدم المحفوظ محلياً وإلا نظام التشغيل.
const THEME_INIT_SCRIPT = `
(function () {
  try {
    var saved = localStorage.getItem('taqyeem_theme');
    if (saved === 'dark' || saved === 'light') {
      document.documentElement.setAttribute('data-theme', saved);
    }
  } catch (e) {}
})();
`;

export function ThemeScript() {
  // eslint-disable-next-line react/no-danger
  return <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />;
}
