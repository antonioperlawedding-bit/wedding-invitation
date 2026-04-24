export const translations = {
  en: {
    // Navigation
    nav: {
      ourStory: 'Our Story',
      ceremony: 'Ceremony',
      schedule: 'Schedule',
      gallery: 'Gallery',
      rsvp: 'RSVP',
    },

    // Hero Section
    hero: {
      inviteLine: 'Invite you to the wedding of',
      scrollDown: 'Scroll down',
    },

    // Countdown
    countdown: {
      days: 'Days',
      hours: 'Hours',
      minutes: 'Minutes',
      seconds: 'Seconds',
    },

    // Gathering
    gathering: {
      viewMap: 'View Map',
    },

    // Events
    events: {
      viewMap: 'View Map',
    },

    // Gallery
    gallery: {
      memory: 'Memory',
      fallbackCaption: 'A beautiful moment',
    },

    // RSVP
    rsvp: {
      respondBy: 'Please respond by',
      fullName: 'Full Name',
      phone: 'Phone Number',
      email: 'Email Address (optional)',
      attendance: 'Attendance',
      numGuests: 'Number of Guests',
      sending: 'Sending...',
      sendRsvp: 'Send RSVP',
      contactDirect: 'Or contact us directly',
      thankYou: 'Thank You!',
      emailSubject: 'Wedding RSVP',
      nameLabel: 'Name',
      phoneLabel: 'Phone',
      emailLabel: 'Email',
      attendanceLabel: 'Attendance',
      guestsLabel: 'Number of Guests',
      na: 'N/A',
    },

    // Couple
    couple: {
      tag: 'Our Story',
      title: 'Made for Each Other',
      groom: 'Groom',
      bride: 'Bride',
      sonOf: 'Son of',
      daughterOf: 'Daughter of',
    },

    // Footer
    footer: {
      madeWith: 'Made with ♡ for',
    },

    // Chatbot
    chatbot: {
      title: 'Wedding Concierge',
      quickQuestions: 'Quick questions',
      q1: "What's the dress code?",
      q2: 'Where is the ceremony?',
      q3: 'What time should I arrive?',
      q4: 'Is there parking available?',
      q5: 'How do I RSVP?',
      fallbackReply: "Thank you for your question! Please contact us at {phone} for more details. We can't wait to celebrate with you! 💐",
      errorReply: "I'm sorry, I had trouble answering that. Please reach out at {email} 💌",
    },
  },

  ar: {
    // Navigation
    nav: {
      ourStory: 'قصتنا',
      ceremony: 'مراسم الزفاف',
      schedule: 'برنامج الحفل',
      gallery: 'ألبوم الصور',
      rsvp: 'تأكيد الحضور',
    },

    // Hero Section
    hero: {
      inviteLine: 'يتشرّفان بدعوتكم لحضور حفل زفاف',
    },

    // Countdown
    countdown: {
      days: 'يوم',
      hours: 'ساعة',
      minutes: 'دقيقة',
      seconds: 'ثانية',
    },

    // Gathering
    gathering: {
      viewMap: 'الخريطة',
    },

    // Events
    events: {
      viewMap: 'الخريطة',
    },

    // Gallery
    gallery: {
      memory: 'ذكرى',
      fallbackCaption: 'لحظة جميلة',
    },

    // RSVP
    rsvp: {
      respondBy: 'يُرجى الرد قبل تاريخ',
      fullName: 'الاسم الكامل',
      phone: 'رقم الهاتف',
      email: 'البريد الإلكتروني (اختياري)',
      attendance: 'الحضور',
      numGuests: 'عدد المدعوّين',
      sending: 'جارٍ الإرسال...',
      sendRsvp: 'إرسال التأكيد',
      contactDirect: 'أو تواصلوا معنا مباشرةً',
      thankYou: 'شكراً لكم!',
      emailSubject: 'تأكيد حضور حفل الزفاف',
      nameLabel: 'الاسم',
      phoneLabel: 'الهاتف',
      emailLabel: 'البريد الإلكتروني',
      attendanceLabel: 'الحضور',
      guestsLabel: 'عدد المدعوّين',
      na: 'غير متوفر',
    },

    // Couple
    couple: {
      tag: 'قصتنا',
      title: 'خُلقا لبعضهما',
      groom: 'العريس',
      bride: 'العروس',
      sonOf: 'نجل',
      daughterOf: 'كريمة',
    },

    // Footer
    footer: {
      madeWith: 'صُنع بكل ♡ لـ',
    },

    // Chatbot
    chatbot: {
      title: 'مساعد حفل الزفاف',
      quickQuestions: 'أسئلة سريعة',
      q1: 'ما هو الزي المطلوب؟',
      q2: 'أين تُقام مراسم الزفاف؟',
      q3: 'في أي وقت يجب أن أصل؟',
      q4: 'هل يتوفر موقف للسيارات؟',
      q5: 'كيف أؤكد حضوري؟',
      fallbackReply: 'شكراً لسؤالكم! يُرجى التواصل معنا على {phone} لمزيد من التفاصيل. نتطلّع للاحتفال معكم! 💐',
      errorReply: 'نعتذر، واجهنا مشكلة في الإجابة. يُرجى التواصل عبر {email} 💌',
    },
  },
};

/**
 * Arabic config overrides – only text that differs from English config.
 * Config values like URLs, dates, names of people stay the same.
 */
export const configAr = {
  wedding: {
    dateFormatted: 'السبت، ٦ حزيران ٢٠٢٦',
    locationFull: 'قاع الريم · شتورا',
    location: 'لبنان',
    bibleVerse: 'إذًا ليسا بعدُ اثنَين بل جسدٌ واحد. فالذي جمعَهُ الله لا يُفرِّقهُ إنسان.',
    bibleReference: 'متّى ١٩:٦',
  },
  couple: {
    groom: {
      parentsDisplay: 'إدوارد وسناء تنوري',
      bio: 'أنطونيو شخص ملتزم وشغوف بالذكاء الاصطناعي والبيانات. يحب ركوب الدراجات والمشي في الطبيعة. يُعرف بعقله التحليلي وإخلاصه لأحبائه وقدرته على إسعاد من حوله.',
    },
    bride: {
      parentsDisplay: 'أنطوان ونور حايك',
      bio: 'بيرلا روح دافئة ومفعمة بالحياة تُنير كل مكان تدخله. تُعرف بضحكتها المُعدية وروحها المبدعة وقلبها الطيب. هي مهندسة زراعية ومزارعة عضوية شغوفة بعملها.',
    },
  },
  ui: {
    hero: {
      tag: 'معًا نبدأ',
    },
    countdown: {
      tag: 'العد التنازلي',
      title: 'ليومنا المميّز',
    },
    gathering: {
      tag: 'يبدأ الاحتفال',
      title: 'التجمّع',
      groomLabel: 'منزل العريس',
      brideLabel: 'مكان العروس',
    },
    events: {
      tag: 'انضمّوا إلينا',
      title: 'الاحتفال',
      subtitle: 'لحظتان. يومٌ ساحرٌ واحد.',
      ceremonyLabel: 'مراسم الزفاف',
      receptionLabel: 'حفل العشاء',
    },
    timeline: {
      tag: 'يوم الزفاف',
      title: 'برنامج يوم الزفاف',
    },
    gallery: {
      tag: 'ذكريات',
      title: 'قصتنا في صور',
    },
    rsvp: {
      tag: 'نرجو الرد',
      title: 'يُشرّفنا حضوركم',
      attendanceOptions: [
        'يسعدني الحضور',
        'أعتذر عن الحضور',
      ],
      successMessage: 'تمّ إرسال تأكيدكم. نتطلّع للاحتفال معكم!',
    },
    listeDeMariage: {
      tag: 'الهدايا',
      title: 'حضوركم هو أغلى هدية',
      message: 'حضوركم في يومنا المميّز هو أغلى هدية على الإطلاق. لمن يرغب، يمكنكم المساهمة عبر الحساب أدناه.',
      accountLabel: 'حساب ويش',
    },
    footer: {
      quote: 'شخصان، نبضُ قلبٍ واحد، بدايةٌ جميلة واحدة إلى الأبد.',
    },
    loading: {
      subtitle: 'على موعدٍ مع الزفاف',
    },
  },
  events: {
    gathering: {
      groom: {
        venue: 'منزل عائلة تنوري',
        address: 'قاع الريم، لبنان',
        description: 'يبدأ الاحتفال بتجمّع في منزل العريس',
      },
      bride: {
        venue: 'فندق مسابكي',
        address: 'شتورا، لبنان',
        description: 'انضمّوا إلى عائلة العروس لوداع جميل',
      },
    },
    ceremony: {
      venue: 'مار شربل - قاع الريم',
      address: 'كنيسة مار شربل، قاع الريم، لبنان',
      description: 'انضمّوا إلينا في مراسم الزفاف في كنيسة مار شربل',
    },
    reception: {
      venue: 'فندق مسابكي',
      address: 'فندق مسابكي، شتورا، لبنان',
      description: 'العشاء والرقص والاحتفال في فندق مسابكي',
    },
    timeline: [
      {
        time: '٤:٣٠ مساءً',
        title: 'وصول الضيوف',
        description: 'يُرجى الوصول مبكرًا لإيجاد مقاعدكم',
        icon: 'guests',
      },
      {
        time: '٥:٠٠ مساءً',
        title: 'بدء المراسم',
        description: 'تُقام المراسم في كنيسة مار شربل',
        icon: 'church',
      },
      {
        time: '٧:٠٠ مساءً',
        title: 'الاستقبال ومشروب الترحيب',
        description: 'استمتعوا بالمشروبات والمقبّلات في فندق مسابكي',
        icon: 'drinks',
      },
      {
        time: '٨:٠٠ مساءً',
        title: 'العشاء',
        description: 'يُقدَّم العشاء في فندق مسابكي',
        icon: 'dinner',
      },
    ],
    chatbot: {
      welcomeMessage: 'مرحبًا! 👋 أنا هنا لمساعدتكم في أي استفسار حول حفل زفاف بيرلا وأنطونيو. لا تتردّدوا في السؤال!',
      placeholderText: 'اسألني عن حفل الزفاف...',
    },
    chatbot_faqs: [
      {
        question: 'ما هو الزي المطلوب؟',
        answer: 'زي شبه رسمي / أنيق للحدائق. فساتين خفيفة، بدلات مريحة. يُرجى ملاحظة أن المراسم ستكون في الخارج على العشب، لذا اختاروا حذاءً مناسبًا!',
      },
      {
        question: 'هل يمكنني إحضار مرافق؟',
        answer: 'نظرًا لمحدودية الأماكن، يمكننا فقط استقبال الضيوف المدعوّين رسميًّا. إذا كان لديكم مرافق، سيكون ذلك مذكورًا في الدعوة.',
      },
      {
        question: 'هل المراسم في الداخل أم الخارج؟',
        answer: 'كلٌّ من المراسم والحفل سيكونان في الخارج. لدينا مظلّة في حال هطول المطر، ومنطقة الحفل مغطّاة جزئيًّا.',
      },
      {
        question: 'هل الأطفال مرحّب بهم؟',
        answer: 'مع حبنا لأطفالكم، قرّرنا أن يكون حفل زفافنا للكبار فقط. نأمل أن تستمتعوا بالأمسية بحرّية!',
      },
      {
        question: 'في أي وقت يجب أن أصل؟',
        answer: 'يُرجى الوصول قبل الساعة ٤:٣٠ مساءً لإيجاد مكان للسيارة والجلوس قبل بدء المراسم.',
      },
      {
        question: 'هل يتوفر موقف سيارات؟',
        answer: 'نعم! يتوفر موقف مجاني واسع. كما تتوفر خدمة صف السيارات.',
      },
    ],
    rsvp: {
      deadline: '2026-05-20',
    },
  },
};
