/* components/workspace/RefShelf.jsx — مستخرَج من حزمة Ds_f056d3 (format 4)
   يصدّر: SAUDI_LIBRARY, RefShelf
 */
(function (Ds, React) {
"use strict";
const _extends = Object.assign;

/* مكتبة المحتوى السعودي — أداة عمل للمعِد:
   لكل مدخل سياق مختصر، وطريق وصول عملي، ومصطلحات ميدانية، وتحذيرات، ومصادر تحقّق،
   وزوايا وأسئلة وإطارات تُدرَج في الحقول بضغطة (منبّهات تُعاد كتابتها — لا يُنقل نص كما هو). */

const INK = "#000",
  PAPER = "#F7F7F7",
  SIGNAL = "#FFB22C",
  CLAY = "#854836";
const HAIR = "rgba(0,0,0,.12)",
  MUTED = "rgba(0,0,0,.6)";
const SAUDI_LIBRARY = [{
  id: "qassim-craft",
  title: "الحِرف اليدوية في القصيم",
  region: "القصيم",
  tracks: ["وثائقي", "مهاري"],
  note: "حرف تنتقل بالمرافقة لا بالشرح: المتعلّم يراقب طويلًا قبل أن يُسمح له بالعمل.",
  access: "ابدأ من جمعية الحرفيين أو سوق الحرف في المنطقة، واطلب اسم أقدم صانع لا الأكثر شهرة. حدّد موعدًا في وقت العمل لا وقت الزيارة.",
  terms: ["الصنعة", "القالب", "الحِلية", "التسوية"],
  cautions: ["لا تصوّر أسرار الخلطات دون إذن صريح", "احترم وقت الإنتاج: التصوير لا يوقف العمل"],
  sources: ["جمعية حرفية محلية", "أمانة المنطقة — سجل الحرفيين", "أستاذ تراث في جامعة قريبة"],
  angles: ["اتبع متعلّمًا واحدًا في يومه الأول من التمكين", "قِس المهارة بما يُتلَف من مادة خام لا بما يُنجَز"],
  questions: ["ما أول شيء سُمح لك بلمسه، ومتى؟", "ما الخطأ الذي لا يُغتفر في هذه الحرفة؟"],
  shots: ["يدان تعملان بلا وجه", "رفّ القطع المتلَفة", "لحظة تسليم الأداة"]
}, {
  id: "ahsa-market",
  title: "أسواق الأحساء الشعبية",
  region: "الأحساء",
  tracks: ["تغطية", "وثائقي"],
  note: "اقتصاد يومي تحكمه المواسم والنخل، وعلاقات بيع تسبق أي عقد مكتوب.",
  access: "الوصول أسهل قبل الفجر مع دخول البضاعة. استأذن من إدارة السوق ومن كل بائع تظهر بضاعته، وتجنّب أوقات الذروة للتصوير الطويل.",
  terms: ["الحلقة", "الدلّال", "الموسم", "الرطب والتمر"],
  cautions: ["لا تصوّر النساء أو أسعار البيع دون إذن", "احرص على عدم إعاقة الحركة في الممرات"],
  sources: ["إدارة السوق", "غرفة الأحساء", "بائع قديم يُعرّف بالسوق"],
  angles: ["يوم في السوق من زاوية بائع واحد: أول عملة تدخل الصندوق وآخرها", "ما يتغيّر في السوق بين موسمين متتاليين"],
  questions: ["ما البضاعة التي لا تُباع إلا في هذا الشهر؟", "من الذي يحدّد السعر هنا فعليًا؟"],
  shots: ["السوق قبل الفتح", "ميزان وكفّ", "زحام الساعة الأخيرة"]
}, {
  id: "farasan-boats",
  title: "صناعة القوارب في جزر فرسان",
  region: "جازان",
  tracks: ["وثائقي", "مهاري"],
  note: "بناء يعتمد على قراءة الخشب والبحر؛ المعرفة شفوية والقياس بالعين واليد.",
  access: "التنسيق يمرّ عادة عبر بلدية فرسان أو نادي بحري محلي. احسب وقت المعدية والطقس، واحجز يومين لا يومًا واحدًا.",
  terms: ["السنبوك", "القلافة", "الجالبوت", "الحزّ"],
  cautions: ["تصوير السواحل قد يحتاج تصريحًا — تحقّق مسبقًا", "الرطوبة والملح: احمِ المعدات"],
  sources: ["بلدية فرسان", "جمعية أهلية للتراث البحري", "صيّاد قديم من المنطقة"],
  angles: ["قارب واحد من أول قطعة خشب إلى أول نزول للماء", "لماذا لم يستبدل الصانع عينه بشريط القياس؟"],
  questions: ["كيف تعرف أن الخشب صالح قبل قطعه؟", "ما القياس الذي لا تكتبه ولا تنساه؟"],
  shots: ["كفّ تمرّ على الخشب", "الهيكل من الداخل", "أول نزول للماء"]
}, {
  id: "nabati",
  title: "رواة الشعر النبطي",
  region: "نجد",
  tracks: ["مقابلة", "وثائقي"],
  note: "ذاكرة سماعية تحفظ النص بلحنه؛ الرواية أمانة لا مادة عرض.",
  access: "الوصول عبر مجالس الأدب والأندية الأدبية، أو عبر باحث في الشعر الشعبي. اطلب جلسة بلا جمهور ليروي بحرية.",
  terms: ["المحاورة", "الشلّة", "الرواية", "القلطة"],
  cautions: ["لا تنشر نصًّا يرفض الراوي روايته", "انسب كل نص إلى قائله بدقة"],
  sources: ["نادٍ أدبي في المنطقة", "باحث في الشعر الشعبي", "أرشيف إذاعي قديم"],
  angles: ["راوٍ يُسأل عن نصّ حفظه ولم يقله علنًا", "كيف تحفظ ذاكرة بلا نصّ مكتوب؟"],
  questions: ["أول قصيدة حفظتها — عمّن أخذتها؟", "ما النص الذي ترفض روايته، ولماذا؟"],
  shots: ["وجه في إنصات", "مجلس شبه فارغ", "يد تضبط الإيقاع"]
}, {
  id: "aflaj",
  title: "الأفلاج والزراعة الحجرية",
  region: "العلا والأفلاج",
  tracks: ["وثائقي", "تغطية"],
  note: "أنظمة ماء قديمة تُدار بحصص زمنية متوارثة؛ هندسة اجتماعية بقدر ما هي مائية.",
  access: "ابدأ من جمعية مزارعين أو مكتب الزراعة، واسأل عن «صاحب الحصة» لا عن المالك. أفضل وقت التصوير عند دور السقي.",
  terms: ["الفلج", "الدور", "الشراج", "الساقية"],
  cautions: ["مواقع أثرية قد تمنع التصوير التجاري — تحقّق من هيئة التراث", "لا تدخل الأراضي دون إذن مالكها"],
  sources: ["جمعية زراعية محلية", "هيئة التراث — فرع المنطقة", "باحث في تاريخ الماء"],
  angles: ["الماء كوقت: من يملك ساعة السقي؟", "أرض واحدة عبر ثلاثة أجيال من ملّاكها"],
  questions: ["كيف تُقسم الحصة عند شحّ الماء؟", "ما الذي تفاوضتم عليه ولم يُكتب؟"],
  shots: ["مجرى الماء", "ظل نخلة على حجر", "دفتر الحصص"]
}, {
  id: "saudi-coffee",
  title: "القهوة السعودية وطُرق إعدادها",
  region: "عام — بفروق منطقية",
  tracks: ["مهاري", "تغطية"],
  note: "التحميص والبهار يختلفان بين منطقة وأخرى، والفرق يُعرَّف اجتماعيًا قبل الذوق.",
  access: "أسهل مسار: محمصة محلية صغيرة أو بيت يشتهر بقهوته. اطلب إعدادًا حقيقيًا لا عرضًا مصوّرًا.",
  terms: ["المحماس", "الدلّة", "الهيل والزعفران", "التقلية"],
  cautions: ["الحرارة والنار: أمّن مكان التصوير", "لا تقدّم فرقًا منطقيًا كحكم على الأفضل"],
  sources: ["محمصة محلية", "مرجع في المطبخ السعودي", "أسرة من المنطقة نفسها"],
  angles: ["فنجان واحد يُصنع مرتين بطريقتين من منطقتين", "ما تقوله درجة التحميص عن أهل البيت"],
  questions: ["كيف تعرف أن التحميص وقف عند حدّه؟", "ما الذي يُغيَّر حين يكون الضيف غريبًا؟"],
  shots: ["حبّ يتغيّر لونه", "صبّ من علو", "فنجان يُرَدّ"]
}, {
  id: "riyadh-seasons",
  title: "المواسم والفعاليات الكبرى",
  region: "الرياض ومدن أخرى",
  tracks: ["تغطية", "مقابلة"],
  note: "أحداث ضخمة يقف خلفها فريق تشغيل لا يظهر؛ القصة غالبًا في التحضير لا في الافتتاح.",
  access: "التصريح عبر الجهة المنظّمة قبل أسبوع على الأقل، ومعه قائمة معدات وأسماء الفريق. اطلب مرافقًا للدخول المقيّد.",
  terms: ["التشغيل", "الباك ستيج", "المناوبة", "خطة الحشود"],
  cautions: ["التصوير الجماهيري يحتاج تنبيهًا وموافقة", "التزم بالمناطق المسموحة وأوقات التصوير"],
  sources: ["الجهة المنظّمة — المكتب الإعلامي", "مسؤول تشغيل الموقع", "متطوّع من الفريق"],
  angles: ["الساعة التي تسبق فتح البوابات", "متطوّع في أول يوم عمل له داخل حدث بهذا الحجم"],
  questions: ["ما الذي أعددتموه ولم يلاحظه أحد؟", "ما أصعب قرار اتخذته وأنت واقف هنا؟"],
  shots: ["ممر فارغ قبل الافتتاح", "أجهزة اتصال", "أول موجة دخول"]
}, {
  id: "pearl-diving",
  title: "ذاكرة الغوص على اللؤلؤ",
  region: "الساحل الشرقي",
  tracks: ["مقابلة", "وثائقي"],
  note: "مهنة انقطعت وبقيت في روايات آخر من عاشها؛ التوثيق هنا سباق مع الوقت.",
  access: "ابحث عبر جمعيات كبار السن ومجالس الأحياء القديمة في القطيف والدمام. جهّز جلسة قصيرة ومريحة، وكرّرها بدل إطالتها.",
  terms: ["الطواش", "النهّام", "الغوص والسيب", "الهيرات"],
  cautions: ["راعِ صحة الضيف: جلسة لا تتجاوز ساعة", "تحقّق من التواريخ مع أكثر من راوٍ"],
  sources: ["جمعية تراث محلية", "متحف إقليمي", "باحث في التاريخ البحري"],
  angles: ["الرواية الأخيرة: ما لم يُسجَّل بعد", "ما ورثه أبناء الغوّاصين ولم يمارسوه"],
  questions: ["ماذا كنتم تسمعون تحت الماء؟", "ما الذي تريد أن يعرفه حفيدك عن ذلك الموسم؟"],
  shots: ["يد فيها أثر عمل", "بحر بلا قارب", "صورة قديمة تُمسك"]
}, {
  id: "makers",
  title: "مصانع صغيرة وورش ناشئة",
  region: "عام",
  tracks: ["مهاري", "تغطية"],
  note: "التصنيع المحلي الصغير يتعلّم بالتجربة والخطأ، وأرشيف الفشل فيه أهم من عيّنة النجاح.",
  access: "حاضنات الأعمال والمناطق الصناعية الصغيرة أسرع طريق. اطلب زيارة يوم إنتاج لا يوم عرض.",
  terms: ["النموذج الأولي", "خط الإنتاج", "الهالك", "دفعة التجربة"],
  cautions: ["لا تكشف أرقام تكلفة دون موافقة", "معدات السلامة شرط للتصوير داخل الورشة"],
  sources: ["حاضنة أعمال", "غرفة تجارية محلية", "مورد مواد خام"],
  angles: ["رفّ العيّنات الفاشلة كخط زمني للتعلّم", "أول طلب كبير: ما الذي كاد يكسر الورشة؟"],
  questions: ["ما العيّنة التي احتفظت بها ولم تبِعها؟", "ما القاعدة التي كتبتها بعد خطأ مكلف؟"],
  shots: ["رفّ العيّنات", "آلة تعمل وحدها", "لوح ملاحظات"]
}, {
  id: "school-fairs",
  title: "الملتقيات الطلابية والمهارية",
  region: "عام",
  tracks: ["تغطية", "وثائقي", "مهاري"],
  note: "الحدث يُقاس عادة بالجائزة، والقصة الحقيقية عند من غادر بعمل غير مكتمل.",
  access: "التنسيق عبر إدارة الملتقى أو المشرف التربوي، ومعه موافقة أولياء الأمور لتصوير الطلاب — اطلبها مكتوبة قبل اليوم.",
  terms: ["الملتقى", "المشرف", "الورشة", "التحكيم"],
  cautions: ["تصوير الطلاب يحتاج موافقة ولي الأمر", "لا تصوّر أعمالًا يطلب صاحبها إخفاءها"],
  sources: ["إدارة الملتقى", "مشرف تربوي", "طالب مشارك سابق"],
  angles: ["طالب واحد من وصوله إلى مغادرته", "ما تعلّمه المشاركون من بعضهم لا من المدرّبين"],
  questions: ["ما الذي جرّبته اليوم لأول مرة؟", "ما الذي كنت ستفعله لو بقي لك ساعة أخرى؟"],
  shots: ["طاولة تسجيل", "زاوية يجلس فيها وحده", "عمل غير مكتمل يُحمل"]
}];
const push = (slot, text) => {
  const r = window.__mudhyaPrep;
  const f = r && r.fields.get(slot);
  if (f && f.append) return f.append(text);
  if (navigator.clipboard) navigator.clipboard.writeText(text);
};
const pickOf = () => window.__mudhyaPrep && window.__mudhyaPrep.pick || {};
const FAV = "mudhya.prep:fav";
const loadFav = () => {
  try {
    return JSON.parse(localStorage.getItem(FAV) || "[]");
  } catch (e) {
    return [];
  }
};

/** رفّ المكتبة — بحث، ترشيح تلقائي، مفضّلة، وإدراج عملي في الحقول. */
function RefShelf({
  track,
  angleTarget = "angle",
  questionTarget = "q-core",
  sequenceTarget = "sequence",
  boardTarget = "board",
  logisticsTarget = "logistics",
  requirementsTarget = "requirements",
  entries
}) {
  const [, beat] = React.useState(0);
  React.useEffect(() => {
    const h = () => beat(n => n + 1);
    window.addEventListener("prep:change", h);
    return () => window.removeEventListener("prep:change", h);
  }, []);
  const mobile = typeof matchMedia === "function" ? matchMedia("(max-width:820px)").matches : false;
  const [open, setOpen] = React.useState(!mobile);
  const [q, setQ] = React.useState("");
  const [sel, setSel] = React.useState(null);
  const [manual, setManual] = React.useState(null);
  const [favOnly, setFavOnly] = React.useState(false);
  const [fav, setFav] = React.useState(loadFav);
  const [msg, setMsg] = React.useState("");
  const pick = pickOf();
  const auto = track || {
    "الإذاعي": "مقابلة",
    "الوثائقي": "وثائقي",
    "المهاري": "مهاري"
  }[pick.section] || (pick.goal === "تغطية حدث" ? "تغطية" : "");
  const active = manual === null ? auto : manual;
  const src = entries || SAUDI_LIBRARY;
  const hit = e => {
    const k = q.trim();
    if (!k) return true;
    return (e.title + " " + e.region + " " + e.note + " " + e.terms.join(" ") + " " + e.angles.join(" ") + " " + e.questions.join(" ")).indexOf(k) > -1;
  };
  const list = src.filter(e => (!active || e.tracks.indexOf(active) > -1) && hit(e) && (!favOnly || fav.indexOf(e.id) > -1));
  const toggleFav = id => {
    const next = fav.indexOf(id) > -1 ? fav.filter(x => x !== id) : fav.concat([id]);
    setFav(next);
    try {
      localStorage.setItem(FAV, JSON.stringify(next));
    } catch (e) {}
  };
  const flash = t => {
    setMsg(t);
    setTimeout(() => setMsg(""), 1800);
  };
  const chip = {
    padding: "9px 13px",
    borderRadius: 3,
    border: "1px solid " + HAIR,
    background: "#fff",
    fontSize: 13.5,
    fontWeight: 700,
    cursor: "pointer",
    fontFamily: "inherit",
    textAlign: "right",
    lineHeight: 1.45,
    color: INK
  };
  const small = {
    ...chip,
    padding: "7px 11px",
    fontSize: 12.5
  };
  const pack = e => {
    e.angles.forEach(a => push(angleTarget, a));
    e.questions.forEach(x => push(questionTarget, x));
    push(sequenceTarget, "سياق مرجعي: " + e.title + " (" + e.region + ") — " + e.note);
    (e.shots || []).forEach(s => push(boardTarget, s));
    push(logisticsTarget, "الوصول: " + e.access);
    (e.cautions || []).forEach(c => push(requirementsTarget, c));
    flash("أُدرجت حزمة «" + e.title + "» في الحقول");
  };
  return /*#__PURE__*/React.createElement("div", {
    className: "pk-noprint",
    style: {
      display: "grid",
      gap: 12,
      padding: 16,
      border: "1px solid " + HAIR,
      borderRadius: 4,
      background: "#fff"
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => setOpen(!open),
    style: {
      display: "grid",
      gap: 4,
      textAlign: "right",
      border: "none",
      background: "transparent",
      padding: 0,
      cursor: "pointer",
      fontFamily: "inherit"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 8,
      fontSize: 15,
      fontWeight: 900
    }
  }, "\u0645\u0643\u062A\u0628\u0629 \u0627\u0644\u0645\u062D\u062A\u0648\u0649 \u0627\u0644\u0633\u0639\u0648\u062F\u064A", /*#__PURE__*/React.createElement("span", {
    style: {
      marginInlineStart: "auto",
      fontSize: 13,
      fontWeight: 700,
      color: MUTED
    }
  }, open ? "إخفاء" : "إظهار")), /*#__PURE__*/React.createElement("span", {
    style: {
      height: 4,
      width: "46%",
      transform: "skewX(-8deg)",
      borderRadius: 2,
      background: CLAY
    }
  })), open ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      fontSize: 12.5,
      fontWeight: 500,
      lineHeight: 1.6,
      color: MUTED
    }
  }, "\u0644\u0643\u0644 \u0645\u062F\u062E\u0644: \u0633\u064A\u0627\u0642\u060C \u0637\u0631\u064A\u0642 \u0648\u0635\u0648\u0644\u060C \u0645\u0635\u0637\u0644\u062D\u0627\u062A \u0645\u064A\u062F\u0627\u0646\u064A\u0629\u060C \u062A\u062D\u0630\u064A\u0631\u0627\u062A\u060C \u0648\u0645\u0635\u0627\u062F\u0631 \u062A\u062D\u0642\u0651\u0642. \xAB\u062D\u0632\u0645\u0629 \u0625\u0639\u062F\u0627\u062F\xBB \u062A\u064F\u062F\u0631\u062C\u0647\u0627 \u0641\u064A \u0627\u0644\u062D\u0642\u0648\u0644 \u2014 \u0645\u0646\u0628\u0651\u0647\u0627\u062A \u062A\u064F\u0639\u0627\u062F \u0643\u062A\u0627\u0628\u062A\u0647\u0627 \u0628\u0635\u064A\u0627\u063A\u062A\u0643\u060C \u0648\u0644\u0627 \u064A\u064F\u0646\u0642\u0644 \u0646\u0635 \u0643\u0645\u0627 \u0647\u0648."), msg ? /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12.5,
      fontWeight: 700,
      background: SIGNAL,
      borderRadius: 3,
      padding: "8px 10px"
    }
  }, msg) : null, /*#__PURE__*/React.createElement("input", {
    value: q,
    onChange: ev => setQ(ev.target.value),
    placeholder: "\u0627\u0628\u062D\u062B: \u0645\u0646\u0637\u0642\u0629\u060C \u062D\u0631\u0641\u0629\u060C \u0645\u0635\u0637\u0644\u062D\u060C \u0633\u0624\u0627\u0644\u2026",
    dir: "rtl",
    style: {
      padding: "11px 12px",
      borderRadius: 4,
      border: "1px solid " + HAIR,
      fontFamily: "inherit",
      fontSize: 14,
      fontWeight: 500,
      minHeight: 44
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexWrap: "wrap",
      gap: 6
    }
  }, ["", "مقابلة", "وثائقي", "مهاري", "تغطية"].map(t => /*#__PURE__*/React.createElement("button", {
    key: t || "all",
    onClick: () => setManual(t),
    style: {
      ...small,
      background: active === t && !favOnly ? INK : "#fff",
      color: active === t && !favOnly ? PAPER : INK,
      borderColor: active === t ? INK : HAIR
    }
  }, t || "الكل")), /*#__PURE__*/React.createElement("button", {
    onClick: () => setFavOnly(!favOnly),
    style: {
      ...small,
      background: favOnly ? SIGNAL : "#fff",
      borderColor: favOnly ? INK : HAIR
    }
  }, "\u2605 \u0627\u0644\u0645\u0641\u0636\u0651\u0644\u0629")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gap: 8,
      maxHeight: mobile ? "none" : 560,
      overflowY: mobile ? "visible" : "auto"
    }
  }, list.length === 0 ? /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      fontSize: 13,
      color: MUTED
    }
  }, "\u0644\u0627 \u0646\u062A\u064A\u062C\u0629 \u2014 \u062C\u0631\u0651\u0628 \u0643\u0644\u0645\u0629 \u0623\u0639\u0645\u0651 \u0623\u0648 \u0627\u062E\u062A\u0631 \xAB\u0627\u0644\u0643\u0644\xBB.") : null, list.map(e => /*#__PURE__*/React.createElement("div", {
    key: e.id,
    className: "pk-ref",
    style: {
      border: "1px solid " + (sel === e.id ? INK : HAIR),
      borderRadius: 4,
      overflow: "hidden"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "stretch"
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => setSel(sel === e.id ? null : e.id),
    style: {
      flex: 1,
      textAlign: "right",
      padding: "11px 12px",
      border: "none",
      background: sel === e.id ? PAPER : "transparent",
      cursor: "pointer",
      fontFamily: "inherit",
      display: "grid",
      gap: 2,
      minHeight: 44
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 14,
      fontWeight: 700
    }
  }, e.title), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      fontWeight: 500,
      color: MUTED
    }
  }, e.region, " \u2014 ", e.tracks.join(" · "))), /*#__PURE__*/React.createElement("button", {
    onClick: () => toggleFav(e.id),
    "aria-label": "\u0645\u0641\u0636\u0651\u0644\u0629",
    style: {
      flex: "none",
      width: 42,
      border: "none",
      background: "transparent",
      cursor: "pointer",
      fontSize: 16,
      color: fav.indexOf(e.id) > -1 ? CLAY : "rgba(0,0,0,.25)"
    }
  }, "\u2605")), sel === e.id ? /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "0 12px 12px",
      display: "grid",
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      fontSize: 13,
      fontWeight: 500,
      lineHeight: 1.65
    }
  }, e.note), /*#__PURE__*/React.createElement("button", {
    style: {
      ...chip,
      background: SIGNAL,
      borderColor: INK,
      fontWeight: 900
    },
    onClick: () => pack(e)
  }, "\u062D\u0632\u0645\u0629 \u0625\u0639\u062F\u0627\u062F \u0643\u0627\u0645\u0644\u0629 \u2190 \u0643\u0644 \u0627\u0644\u062D\u0642\u0648\u0644"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gap: 6
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      fontWeight: 700,
      color: MUTED
    }
  }, "\u0627\u0644\u0648\u0635\u0648\u0644 \u0648\u0627\u0644\u062A\u0646\u0633\u064A\u0642"), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      fontSize: 12.5,
      fontWeight: 500,
      lineHeight: 1.6
    }
  }, e.access), /*#__PURE__*/React.createElement("button", {
    style: small,
    onClick: () => {
      push(logisticsTarget, "الوصول: " + e.access);
      flash("أُدرج في «الموقع والوقت»");
    }
  }, "\u0623\u062F\u0631\u062C \u0641\u064A \u0645\u062A\u0637\u0644\u0628\u0627\u062A \u0627\u0644\u062A\u0635\u0648\u064A\u0631")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gap: 6
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      fontWeight: 700,
      color: MUTED
    }
  }, "\u0632\u0648\u0627\u064A\u0627"), e.angles.map((a, i) => /*#__PURE__*/React.createElement("button", {
    key: i,
    style: chip,
    onClick: () => {
      push(angleTarget, a);
      flash("أُدرجت الزاوية");
    }
  }, a))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gap: 6
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      fontWeight: 700,
      color: MUTED
    }
  }, "\u0623\u0633\u0626\u0644\u0629"), e.questions.map((x, i) => /*#__PURE__*/React.createElement("button", {
    key: i,
    style: chip,
    onClick: () => {
      push(questionTarget, x);
      flash("أُدرج السؤال");
    }
  }, x))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gap: 6
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      fontWeight: 700,
      color: MUTED
    }
  }, "\u0625\u0637\u0627\u0631\u0627\u062A \u0645\u0642\u062A\u0631\u062D\u0629"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexWrap: "wrap",
      gap: 6
    }
  }, (e.shots || []).map((s, i) => /*#__PURE__*/React.createElement("button", {
    key: i,
    style: small,
    onClick: () => {
      push(boardTarget, s);
      flash("أُضيف إطار");
    }
  }, s)))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gap: 6
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      fontWeight: 700,
      color: MUTED
    }
  }, "\u062A\u062D\u0630\u064A\u0631\u0627\u062A \u0648\u0623\u0630\u0648\u0646\u0627\u062A"), (e.cautions || []).map((c, i) => /*#__PURE__*/React.createElement("button", {
    key: i,
    style: small,
    onClick: () => {
      push(requirementsTarget, c);
      flash("أُدرج في المتطلبات");
    }
  }, c))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gap: 6
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      fontWeight: 700,
      color: MUTED
    }
  }, "\u0645\u0635\u0637\u0644\u062D\u0627\u062A \u0645\u064A\u062F\u0627\u0646\u064A\u0629 \u2014 \u0644\u062A\u062A\u062D\u062F\u0651\u062B \u0628\u0644\u063A\u0629 \u0627\u0644\u0645\u064A\u062F\u0627\u0646"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexWrap: "wrap",
      gap: 6
    }
  }, (e.terms || []).map((t, i) => /*#__PURE__*/React.createElement("span", {
    key: i,
    style: {
      ...small,
      cursor: "default",
      background: PAPER
    }
  }, t)))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gap: 6
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      fontWeight: 700,
      color: MUTED
    }
  }, "\u0645\u0635\u0627\u062F\u0631 \u062A\u062D\u0642\u0651\u0642 \u0645\u0642\u062A\u0631\u062D\u0629"), /*#__PURE__*/React.createElement("ul", {
    style: {
      margin: 0,
      paddingInlineStart: 16,
      fontSize: 12.5,
      fontWeight: 500,
      lineHeight: 1.7
    }
  }, (e.sources || []).map((s, i) => /*#__PURE__*/React.createElement("li", {
    key: i
  }, s))))) : null)))) : null);
}

Object.assign(Ds, { SAUDI_LIBRARY, RefShelf });
})(window.Ds = window.Ds || {}, window.React);
