/**
 * Verifies the OpenRouter API key by making a small API call.
 * @param apiKey The OpenRouter API key.
 * @returns A boolean indicating if the key is valid.
 */
export const verifyApiKey = async (apiKey: string): Promise<boolean> => {
  if (!apiKey) return false;
  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'open-r1/olympiccoder-32b',
        messages: [{ role: 'user', content: 'Hi' }],
        max_tokens: 5,
      }),
    });
    const data = await response.json();
    // A successful response or a credit error means the key is valid.
    // A 401 Unauthorized error means the key is bad.
    if (response.status === 401) return false;
    return !!(data.choices || data.error);
  } catch (error) {
    console.error("OpenRouter API Key verification failed:", error);
    return false;
  }
};

/**
 * Core function to call the OpenRouter API.
 * @param apiKey The API key.
 * @param prompt The complete prompt to send to the model.
 * @returns The text response from the model.
 */
const getCompletion = async (apiKey: string, prompt: string): Promise<string> => {
  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': location.protocol + '//' + location.host,
        'X-Title': 'ICPC AI Solver',
      },
      body: JSON.stringify({
        model: 'open-r1/olympiccoder-32b',
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    const data = await response.json();

    if (!response.ok) {
        const errorMessage = data?.error?.message || `HTTP error! status: ${response.status}`;
        throw new Error(`OpenRouter API Error: ${errorMessage}`);
    }

    if (data.choices && data.choices.length > 0 && data.choices[0].message?.content) {
      return data.choices[0].message.content;
    } else {
      throw new Error('Invalid response structure from OpenRouter API.');
    }
  } catch (e: any) {
    console.error("Error calling OpenRouter API:", e);
    throw e; // Re-throw the original error to be caught by the caller
  }
};

/**
 * Generates an analysis of the problem statement using OpenRouter.
 */
export const generateAnalysis = async (apiKey: string, problemText: string): Promise<string> => {
  const prompt = `Bạn là một huấn luyện viên ICPC chuyên nghiệp. Nhiệm vụ của bạn là phân tích bài toán lập trình thi đấu sau đây. Đừng giải quyết nó vội. Chia nhỏ vấn đề thành các phần sau:
1.  **Tóm tắt bài toán:** Một bản tóm tắt ngắn gọn, một đoạn văn về mục tiêu.
2.  **Định dạng Input/Output:** Mô tả rõ ràng dữ liệu đầu vào và đầu ra trông như thế nào.
3.  **Ràng buộc:** Liệt kê tất cả các ràng buộc (ví dụ: N <= 10^5, giới hạn thời gian, giới hạn bộ nhớ).
4.  **Khái niệm cốt lõi:** Xác định các thuật toán, cấu trúc dữ liệu và kỹ thuật giải quyết vấn đề chính có thể liên quan (ví dụ: Quy hoạch động, Duyệt đồ thị, Tìm kiếm nhị phân, Cấu trúc dữ liệu như Segment Tree hoặc Fenwick Tree).
5.  **Các cạm bẫy tiềm ẩn:** Đề cập đến bất kỳ trường hợp biên khó khăn hoặc sai lầm phổ biến nào cần chú ý.

Đây là đề bài:
\`\`\`
${problemText}
\`\`\``;
  return getCompletion(apiKey, prompt);
};

/**
 * Generates a solution for the problem using OpenRouter.
 */
export const generateSolution = async (apiKey: string, problemText: string, analysisText: string): Promise<string> => {
  const prompt = `Bạn là một người đoạt huy chương vàng ICPC chuyên nghiệp. Nhiệm vụ của bạn là cung cấp một giải pháp hoàn chỉnh cho bài toán lập trình thi đấu sau đây. Sử dụng phân tích được cung cấp làm điểm khởi đầu. Cung cấp giải pháp theo định dạng sau:
1.  **Hướng tiếp cận chi tiết:** Giải thích từng bước logic đằng sau thuật toán bạn đã chọn. Giải thích tại sao cách tiếp cận này là đúng và đủ hiệu quả để vượt qua trong giới hạn thời gian thông thường, tham chiếu đến các ràng buộc của bài toán.
2.  **Giải pháp C++:** Cung cấp mã nguồn C++ hoàn chỉnh, có bình luận rõ ràng. Mã phải sạch sẽ, dễ đọc và sẵn sàng để biên dịch.

Đây là đề bài:
\`\`\`
${problemText}
\`\`\`

Và đây là phân tích ban đầu:
\`\`\`
${analysisText}
\`\`\``;
  return getCompletion(apiKey, prompt);
};
