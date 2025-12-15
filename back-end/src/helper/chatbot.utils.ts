const blind_replies = [
  "Please try something more descriptive.",
  "Oh! It appears you wrote something I don't understand yet.",
  "Do you mind trying to rephrase that?",
  "I'm terribly sorry, I didn't quite catch that.",
  "I can't answer that yet, please try asking something else."
];

const response_patterns = [
  {
    "response_type": "greeting",
    "user_input": ["hello", "hi", "hey"],
    "bot_response": "<p>Hey there!</p>",
    "required_words": []
  },
  {
    "response_type": "greeting",
    "user_input": ["see you", "goodbye", "bye"],
    "bot_response": "<p>See you later!</p>",
    "required_words": []
  },
  {
    "response_type": "greeting",
    "user_input": ["nice", "to", "meet", "you"],
    "bot_response": "<p>The pleasure is all mine!</p>",
    "required_words": ["nice", "meet", "you"]
  },
  {
    "response_type": "question",
    "user_input": ["how", "are", "you"],
    "bot_response": "I'm great! Thanks for asking.",
    "required_words": ["how", "are", "you"]
  },
  {
    "response_type": "help",
    "user_input": ["/help"],
    "bot_response": `
    <p>You can type:</p>
    <p>"setting" to edit your settings</p>
    <p>"profile" to edit your profile</p>
    `,
    "required_words": ["/help"]
  },
  {
    "response_type": "helpall",
    "user_input": ["/helpall"],
    "bot_response": `
    <p>Hướng dẫn đăng ký và xác nhận tài khoản để kích hoạt thiết bị:</p>
    <ol>
      <li>Đăng ký tài khoản và xác nhận email để kích hoạt.</li>
      <li>Đăng nhập vào trang dashboard để quan sát tình hình máy đo.</li>
      <li>Để kết nối thiết bị, vui lòng kết nối Wi-Fi tên <b>ESP32_Config</b> với mật khẩu <b>12345678</b>.</li>
      <li>Nhập mạng Wi-Fi muốn thiết bị kết nối trên trang web.</li>
      <li>Vào trang Profile và bấm Save để lưu thông tin kết nối, hệ thống sẽ xác nhận kết nối thiết bị.</li>
    </ol>
  `,
    "required_words": ["/helpall"]
  }
]

function blindResponse() {
  let rand_idx = Math.floor(Math.random() * blind_replies.length);
  return blind_replies[rand_idx];
}

export function generateResponse(input: string) {
  const words = input.toLocaleLowerCase('vi').split(/\s+|[,;?!.-]\s*/);

  let response_rank: number[] = [];

  for (let pattern of response_patterns) {
    let score = 0;
    let requirement_check = true;

    for (let required_word of pattern["required_words"]) {
      requirement_check &&= words.includes(required_word);
    }

    if (requirement_check) {
      for (let word of words) {
        if (pattern["user_input"].includes(word))
          score++;
      }
    }

    response_rank.push(score);
  }

  let best_response_idx = 0;
  for (let i = 0; i < response_rank.length; i++) {
    if (response_rank[i] > response_rank[best_response_idx])
      best_response_idx = i;
  }

  if (response_rank[best_response_idx] > 0) {
    return response_patterns[best_response_idx]["bot_response"];
  }

  return blindResponse();
}