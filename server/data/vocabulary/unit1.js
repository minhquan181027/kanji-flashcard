// Từ vựng Unit 1
// Mỗi từ: { word, hiragana, romaji, meaning, emoji?, example: { jp, romaji, vi } }
module.exports = {
    id: "unit1",
    title: "Unit 1",
    description: "Nơi chốn trong tòa nhà, đồ vật và hỏi giá",
    words: [
        {
            word: "食堂", hiragana: "しょくどう", romaji: "shokudō", meaning: "nhà ăn",
            example: { jp: "わたしは 食堂（しょくどう）で ごはんを 食（た）べます。", romaji: "Watashi wa shokudō de gohan o tabemasu.", vi: "Tôi ăn cơm ở nhà ăn." }
        },
        {
            word: "会議室", hiragana: "かいぎしつ", romaji: "kaigi-shitsu", meaning: "phòng họp",
            example: { jp: "会議室（かいぎしつ）は どこですか。", romaji: "Kaigi-shitsu wa doko desu ka.", vi: "Phòng họp ở đâu?" }
        },
        {
            word: "受付", hiragana: "うけつけ", romaji: "uketsuke", meaning: "quầy tiếp tân, quầy lễ tân",
            example: { jp: "受付（うけつけ）は どこですか。", romaji: "Uketsuke wa doko desu ka.", vi: "Quầy tiếp tân ở đâu?" }
        },
        {
            word: "ロビー", hiragana: "ろびー", romaji: "robī", meaning: "sảnh, tiền sảnh",
            example: { jp: "ロビーで 待（ま）ちます。", romaji: "Robī de machimasu.", vi: "Tôi chờ ở sảnh." }
        },
        {
            word: "部屋", hiragana: "へや", romaji: "heya", meaning: "căn phòng, phòng",
            example: { jp: "私（わたし）の 部屋（へや）は きれいです。", romaji: "Watashi no heya wa kirei desu.", vi: "Phòng của tôi sạch đẹp." }
        },
        {
            word: "階段", hiragana: "かいだん", romaji: "kaidan", meaning: "cầu thang",
            example: { jp: "階段（かいだん）は どこですか。", romaji: "Kaidan wa doko desu ka.", vi: "Cầu thang ở đâu?" }
        },
        {
            word: "エレベーター", hiragana: "えれべーたー", romaji: "erebētā", meaning: "thang máy",
            example: { jp: "エレベーターで 10階（じゅっかい）まで 行（い）きます。", romaji: "Erebētā de jukkai made ikimasu.", vi: "Tôi đi thang máy lên tầng 10." }
        },
        {
            word: "エスカレーター", hiragana: "えすかれーたー", romaji: "esukarētā", meaning: "thang cuốn",
            example: { jp: "エスカレーターで 2階（にかい）に 行（い）きましょう。", romaji: "Esukarētā de nikai ni ikimashō.", vi: "Chúng ta đi thang cuốn lên tầng 2 nhé." }
        },
        {
            word: "国", hiragana: "くに", romaji: "kuni", meaning: "đất nước, quốc gia",
            example: { jp: "私（わたし）の 国（くに）は ベトナムです。", romaji: "Watashi no kuni wa Betonamu desu.", vi: "Đất nước của tôi là Việt Nam." }
        },
        {
            word: "うち", hiragana: "うち", romaji: "uchi", meaning: "nhà, nhà mình; bên mình; công ty/trường của mình",
            example: { jp: "うちは ベトナムの会社（かいしゃ）です。", romaji: "Uchi wa Betonamu no kaisha desu.", vi: "Công ty bên tôi là một công ty Việt Nam." }
        },
        {
            word: "電話", hiragana: "でんわ", romaji: "denwa", meaning: "điện thoại; cuộc gọi điện thoại", emoji: "📱",
            example: { jp: "母（はは）に 電話（でんわ）を かけます。", romaji: "Haha ni denwa o kakemasu.", vi: "Tôi gọi điện cho mẹ." }
        },
        {
            word: "靴", hiragana: "くつ", romaji: "kutsu", meaning: "giày", emoji: "👟",
            example: { jp: "この靴（くつ）は ちょっと 大（おお）きいです。", romaji: "Kono kutsu wa chotto ōkii desu.", vi: "Đôi giày này hơi rộng/lớn một chút." }
        },
        {
            word: "ネクタイ", hiragana: "ねくたい", romaji: "nekutai", meaning: "cà vạt", emoji: "👔",
            example: { jp: "父（ちち）は ネクタイを しています。", romaji: "Chichi wa nekutai o shite imasu.", vi: "Bố tôi đang đeo cà vạt." }
        },
        {
            word: "ワイン", hiragana: "わいん", romaji: "wain", meaning: "rượu vang", emoji: "🍷",
            example: { jp: "父（ちち）は ワインを 飲（の）みません。", romaji: "Chichi wa wain o nomimasen.", vi: "Bố tôi không uống rượu vang." }
        },
        {
            word: "タバコ", hiragana: "たばこ", romaji: "tabako", meaning: "thuốc lá", emoji: "🚬",
            example: { jp: "父（ちち）は タバコを 吸（す）いません。", romaji: "Chichi wa tabako o suimasen.", vi: "Bố tôi không hút thuốc." }
        },
        {
            word: "売り場", hiragana: "うりば", romaji: "uriba", meaning: "quầy/khu vực bán hàng", emoji: "🏬",
            example: { jp: "靴（くつ）の 売（う）り場（ば）は どこですか。", romaji: "Kutsu no uriba wa doko desu ka.", vi: "Khu bán giày ở đâu ạ?" }
        },
        {
            word: "地下", hiragana: "ちか", romaji: "chika", meaning: "tầng hầm", emoji: "🏢",
            example: { jp: "駐車場（ちゅうしゃじょう）は 地下（ちか）です。", romaji: "Chūshajō wa chika desu.", vi: "Bãi đỗ xe ở tầng hầm." }
        },
        {
            word: "何階", hiragana: "なんがい", romaji: "nangai", meaning: "tầng mấy", emoji: "🏢",
            example: { jp: "すみません、何階（なんがい）ですか。", romaji: "Sumimasen, nangai desu ka.", vi: "Xin lỗi, đây là tầng mấy ạ?" }
        },
        {
            word: "いくら", hiragana: "いくら", romaji: "ikura", meaning: "bao nhiêu tiền / giá bao nhiêu", emoji: "💴",
            example: { jp: "これは いくらですか。", romaji: "Kore wa ikura desu ka.", vi: "Cái này bao nhiêu tiền ạ?" }
        },
        {
            word: "百", hiragana: "ひゃく", romaji: "hyaku", meaning: "trăm", emoji: "💯",
            example: { jp: "これは 百円（ひゃくえん）です。", romaji: "Kore wa hyaku-en desu.", vi: "Cái này 100 yên." }
        },
        {
            word: "千", hiragana: "せん", romaji: "sen", meaning: "một nghìn, nghìn", emoji: "💰",
            example: { jp: "これは 千円（せんえん）です。", romaji: "Kore wa sen-en desu.", vi: "Cái này 1.000 yên." }
        },
        {
            word: "万", hiragana: "まん", romaji: "man", meaning: "vạn = 10.000", emoji: "💴",
            example: { jp: "これは 一万円（いちまんえん）です。", romaji: "Kore wa ichiman-en desu.", vi: "Cái này 10.000 yên." }
        },
    ],
};