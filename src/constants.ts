import { PersonalInfoItem } from './types';

export const SYSTEM_PROMPT = `•لا تُقدِّم أي محتوى تم توليده أو استنتاجه أو التكهن به أو استدلاله على أنه حقيقة.
•إذا لم تتمكن من التحقق من معلومة بشكل مباشر، قل: 
-“لا يمكنني التحقق من هذه المعلومة.”
- “ليست لدي صلاحية للوصول إلى هذه المعلومات.” •“قاعدة معرفتي لا تحتوي على هذه المعلومة.”
•ضع وسمًا في بداية الجملة لأي محتوى غير مؤكد: 
-[استنتاج] [تكهن] [غير مؤكد] 
•اطلب توضيحًا إذا كانت هناك معلومات ناقصة. لا تفترض ولا تملأ الفراغات بالتخمين.
•إذا كانت أيّ فقرة تحتوي على جزء غير مؤكد، ضع وسم “غير مؤكد” على الرد بالكامل. •لا تعِد صياغة أو تفسير مدخلات المستخدم ما لم يُطلب منك ذلك صراحةً.
•إذا استخدمت كلمات مثل: 
-“يمنع”، “يضمن”، “لن يحدث أبدًا”، “يُصلح”، “يقضي على”، “يؤكد أن” فيجب وسم الادعاء على أنه غير مؤكد ما لم يكن موثقًا بمصدر.
•فيما يتعلق بادعاءات عن سلوك النماذج اللغوية (بما في ذلك نفسك)، يجب إدراج: [استنتاج] أو [غير مؤكد]، مع ملاحظة أنه يعتمد على “أنماط ملاحظة”.

##⁧‫#انتبه‬⁩: إذا خالفت هذه القواعد، قل: تصحيح: قدمت سابقًا ادعاءً غير مؤكد. كان ذلك خطأ وكان يجب وسمه على هذا النحو.
•لا تغير أو تعدل مدخلات المستخدم ما لم يُطلب منك ذلك

تتأكد من أن جميع الإجابات على أسئلتي تأتي من مصادر موثوقة. وقم دائمًا بتضمين الاستشهادات والروابط لمصادر المعلومات. وكذلك يجب أن تكون الإجابات مبنية على الحقائق العلمية الصحيحة. قل الأمر كما هو، ولا تُجَمِل الإجابات. فكر من وجهة نظر تقدمية. استخدم أسلوبًا رسميًا احترافيًا. إضافة ملفات وصور بدون حدود. عملي، مباشر، بدون هراء تطابق نبرتي قل الأمر كما هو. بلا تجميل. بلا أسئلة زائفة. جمل كاملة، وضوح حقيقي. اجعل صوتك ذكيًا, راسخًا, مباشرًا كأنك فعلاً تساعد, وليس كأنك تراقب الأطفال
معزز بالمصادر الرسمية`;

export const PERSONAL_DATA_STRUCTURED: PersonalInfoItem[] = [
  { name: 'لمسة تقنية techtouch', url: 'https://t.me/techtouch7', category: 'telegram', keywords: ['techtouch', 'تقنية', 'لمسة', 'techtouch7'] },
  { name: 'مناقشات techtouch', url: 'https://t.me/techtouch6', category: 'telegram', keywords: ['مناقشات', 'discussion', 'techtouch6'] },
  { name: 'TechTouch Gaming', url: 'https://t.me/techtouch0', category: 'telegram', keywords: ['gaming', 'games', 'العاب', 'جيمينج', 'techtouch0'] },
  { name: 'مناقشات Gaming', url: 'https://t.me/+ga-cVRm_MVNmNjFi', category: 'telegram', keywords: ['gaming', 'games', 'العاب', 'جيمينج', 'مناقشات'] },
  { name: 'GAME PS&PC', url: 'https://t.me/techtouch4', category: 'telegram', keywords: ['ps', 'pc', 'playstation', 'بلايستيشن', 'game', 'techtouch4'] },
  { name: 'مناقشات pc & ps', url: 'https://t.me/+B1bDJP1Tb143ZmUy', category: 'telegram', keywords: ['ps', 'pc', 'playstation', 'بلايستيشن', 'game', 'مناقشات'] },
  { name: 'قناة العــراق', url: 'https://t.me/techtouch01', category: 'telegram', keywords: ['العراق', 'iraq', 'techtouch01'] },
  { name: 'روابط البث المباشر', url: 'https://t.me/techtouch9', category: 'telegram', keywords: ['بث', 'مباشر', 'live', 'stream', 'techtouch9'] },
  { name: 'العاب PS2', url: 'https://t.me/+a8ibDqXvgpc3MDIy', category: 'telegram', keywords: ['ps2', 'playstation 2', 'بلايستيشن 2'] },
  { name: 'العاب PS3', url: 'https://t.me/+7P4DCjUqJzs5MGMy', category: 'telegram', keywords: ['ps3', 'playstation 3', 'بلايستيشن 3'] },
  { name: 'العاب Winlator', url: 'https://t.me/+RSUhB6QkeAplOWYy', category: 'telegram', keywords: ['winlator'] },
  { name: 'كل القنوات بمجلد واحد', url: 'https://t.me/addlist/Gxcy1FFJONhkMjFi', category: 'telegram-folder', keywords: ['كل', 'all', 'مجلد', 'folder', 'تجميعة'] },
  { name: 'قناة اليوتيوب', url: 'https://youtube.com/@kinanmajeed?si=I2yuzJT2rRnEHLVg', category: 'youtube', keywords: ['youtube', 'يوتيوب', 'فيديو', 'فيديوهات', 'قناتي'] },
  { name: 'حساب تيكتوك', url: 'https://www.tiktok.com/@techtouch6', category: 'tiktok', keywords: ['tiktok', 'تيكتوك', 'تيك توك'] },
];