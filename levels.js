// Game Levels Data for "Non-Formal Education" - Interactive Mechanics
const gameLevels = [
    {
        id: 1,
        title: "خطوات التخطيط",
        description: "رتب الخطوات التالية لبناء مبادرة طلابية ناجحة بالضغط على خطوتين لتبديل أماكنهما:",
        icon: "fa-list-ol",
        type: "sequence",
        items: [
            { id: "s1", text: "تحديد الاحتياج والمشكلة", order: 1 },
            { id: "s2", text: "صياغة الأهداف بوضوح", order: 2 },
            { id: "s3", text: "بناء فريق العمل", order: 3 },
            { id: "s4", text: "البدء بالتنفيذ", order: 4 },
            { id: "s5", text: "التقييم وقياس الأثر", order: 5 }
        ]
    },
    {
        id: 2,
        title: "مطابقة المفاهيم",
        description: "اضغط على كل مصطلح في اليمين، ثم اضغط على تعريفه في اليسار للتوصيل:",
        icon: "fa-puzzle-piece",
        type: "matching",
        pairs: [
            { id: "m1", term: "القيادة", definition: "القدرة على التأثير في الآخرين وتوجيههم لتحقيق هدف مشترك." },
            { id: "m2", term: "العمل الجماعي", definition: "تعاون مجموعة من الأفراد وتكامل مهاراتهم لإنجاز مهمة." },
            { id: "m3", term: "المبادرة", definition: "التحرك الذاتي لحل مشكلة قبل أن يُطلب منك ذلك." }
        ]
    },
    {
        id: 3,
        title: "الكلمة المبعثرة",
        description: "اضغط على الحروف بالترتيب الصحيح لتكوين الكلمة التي تمثل الجوهر الأساسي للقيادة:",
        icon: "fa-font",
        type: "scrambled",
        word: "تأثير",
        letters: ["ي", "ر", "ث", "ت", "أ"] // Provided scrambled for UI initially
    },
    {
        id: 4,
        title: "الاستنتاج الذكي",
        description: "عضو في فريقك لا يرد على الرسائل ويغيب عن الاجتماعات، لحل هذه المشكلة تحتاج إلى مهارة الـ...",
        icon: "fa-keyboard",
        type: "short-input",
        answer: "تواصل",
        altAnswers: ["التواصل", "حوار", "الحوار"]
    },
    {
        id: 5,
        title: "العنصر المختلف",
        description: "ثلاثة من هذه العناصر تنتمي لـ (التربية غير المنهجية). اضغط على العنصر المختلف الشاذ:",
        icon: "fa-search",
        type: "odd-one-out",
        options: [
            { text: "تطوير مهارة الحوار", isOdd: false },
            { text: "تنظيم حملة تطوعية", isOdd: false },
            { text: "حفظ المنهج للامتحان", isOdd: true },
            { text: "قيادة فريق عمل", isOdd: false }
        ]
    },
    {
        id: 6,
        title: "تصنيف الأنشطة",
        description: "اضغط على كل نشاط، ثم اضغط على الصندوق المناسب لتصنيفه:",
        icon: "fa-boxes",
        type: "categorize",
        categories: [
            { id: "cat1", name: "تعليم منهجي", color: "var(--danger)" },
            { id: "cat2", name: "تربية غير منهجية", color: "var(--success)" }
        ],
        items: [
            { id: "i1", text: "محاضرة الرياضيات", category: "cat1" },
            { id: "i2", text: "الاختبار النهائي", category: "cat1" },
            { id: "i3", text: "نادي المناظرات", category: "cat2" },
            { id: "i4", text: "دورة القيادة", category: "cat2" },
            { id: "i5", text: "قراءة المراجع العلمية", category: "cat1" },
            { id: "i6", text: "تنظيم حملة تطوعية", category: "cat2" },
            { id: "i7", text: "الفصل الدراسي الثامن", category: "cat1" },
            { id: "i8", text: "إدارة نادي التصوير", category: "cat2" }
        ]
    },
    {
        id: 7,
        title: "القفل الرقمي",
        description: "حل اللغز لفتح القفل: \nإذا قسمنا فريق عمل مكون من 12 طالباً إلى 4 لجان متساوية، وكل لجنة تحتاج قائد واحد.. ما هو الرقم السري المكون من (عدد اللجان، عدد القادة، عدد الأعضاء في اللجنة الواحدة) بالترتيب؟",
        icon: "fa-lock",
        type: "number-lock",
        passcode: "443" // 4 committees, 4 leaders, 3 members per committee (12/4=3)
    },
    {
        id: 8,
        title: "اكتشاف المهارات",
        description: "اكتشف واضغط فقط على الــ 3 كلمات التي تمثل (المهارات الناعمة Soft Skills) للنجاح في الجامعة:",
        icon: "fa-eye",
        type: "hidden-items",
        correctCount: 3,
        items: [
            { text: "البرمجة", isCorrect: false },
            { text: "المرونة", isCorrect: true },
            { text: "التاريخ", isCorrect: false },
            { text: "التفكير الناقد", isCorrect: true },
            { text: "إدارة الوقت", isCorrect: true },
            { text: "الطباعة", isCorrect: false },
            { text: "المعادلات", isCorrect: false },
            { text: "الفيزياء", isCorrect: false }
        ]
    },
    {
        id: 9,
        title: "مهارات حل المشكلات",
        description: "اضغط على الخطوة المناسبة، ثم اضغط على الوصف الصحيح (لترتيب التعامل مع مشكلة طارئة):",
        icon: "fa-exclamation-triangle",
        type: "matching",
        pairs: [
            { id: "m4", term: "استيعاب المشكلة", definition: "الهدوء وفهم سبب الإلغاء وحجم التأثير." },
            { id: "m5", term: "إيجاد البدائل", definition: "البحث عن قاعات أخرى أو تحويل الفعالية عن بُعد." },
            { id: "m6", term: "التواصل الفعّال", definition: "إبلاغ الجمهور والضيوف بتغيير المكان فوراً." }
        ]
    },
    {
        id: 10,
        title: "التوصيل البصري",
        description: "اربط كل نشاط طلابي بالمهارة الأساسية التي يطورها (اضغط على النشاط ثم اضغط على المهارة لربطهما بخط):",
        icon: "fa-project-diagram",
        type: "line-connect",
        pairs: [
            { id: "lc1", right: "المناظرات الجامعية", left: "التفكير الناقد والحوار" },
            { id: "lc2", right: "تنظيم الفعاليات", left: "التخطيط وإدارة الوقت" },
            { id: "lc3", right: "العمل التطوعي", left: "العطاء المجتمعي" },
            { id: "lc4", right: "رئاسة نادي طلابي", left: "القيادة والتوجيه" }
        ]
    },
    {
        id: 11,
        title: "لعبة الذاكرة التربوية",
        description: "اقلب البطاقات لتجد الأزواج المترابطة التي تشكل مفاهيم العمل الطلابي:",
        icon: "fa-clone",
        type: "memory-cards",
        pairs: [
            { pairId: "mem1", icon1: "fa-users", text1: "فريق العمل", icon2: "fa-hands-helping", text2: "التعاون" },
            { pairId: "mem2", icon1: "fa-lightbulb", text1: "المشكلة", icon2: "fa-tools", text2: "الحل الإبداعي" },
            { pairId: "mem3", icon1: "fa-bullseye", text1: "الهدف", icon2: "fa-chart-line", text2: "الخطة" },
            { pairId: "mem4", icon1: "fa-comments", text1: "الاستماع", icon2: "fa-ear-listen", text2: "الفهم" }
        ]
    },
    {
        id: 12,
        title: "حقيقة أم خرافة؟",
        description: "أجب بصح أو خطأ بناءً على معرفتك بالأنشطة اللامنهجية وما تقدمه للطالب:",
        icon: "fa-check-double",
        type: "true-false",
        questions: [
            { text: "الأنشطة اللامنهجية تضيع وقت الطالب الأكاديمي ولا تفيده مستقبلاً.", isTrue: false },
            { text: "تعتبر المبادرات الطلابية بيئة خصبة وصحية لتعلم مهارات القيادة.", isTrue: true },
            { text: "العمل التطوعي يفيد المجتمع فقط، ولا يعود بأي فائدة على شخصية الطالب.", isTrue: false },
            { text: "المهارات الناعمة تُكتسب بالممارسة والانخراط بالأنشطة أكثر من التلقين.", isTrue: true }
        ]
    },
    {
        id: 13,
        title: "مصفوفة إدارة الوقت",
        description: "حسب مصفوفة أيزنهاور المشهورة، حدد المربع الذي يمثل (الأنشطة الاستراتيجية والتخطيط) التي يجب التركيز عليها:",
        icon: "fa-border-all",
        type: "matrix-click",
        correctId: 2,
        quadrants: [
            { id: 1, name: "عاجل ومهم (إدارة الأزمات)" },
            { id: 2, name: "مهم وغير عاجل (التخطيط والقيادة)" },
            { id: 3, name: "عاجل وغير مهم (مقاطعات خارجية)" },
            { id: 4, name: "غير مهم وغير عاجل (مضيعة للوقت)" }
        ]
    },
    {
        id: 14,
        title: "المعادلة التربوية",
        description: "اختر النتيجة الصحيحة التي تكمل هذه المعادلة التي تمثل صناعة القادة:",
        icon: "fa-calculator",
        type: "math-puzzle",
        equation: "طالب + (رؤية × مبادرة) = ؟",
        options: ["جهد ضائع وإرهاق", "صناعة التغيير والأثر", "شهادة جامعية فقط", "تسلية ووقت فراغ"],
        correctOption: "صناعة التغيير والأثر"
    }
];
