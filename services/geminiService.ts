import { GoogleGenAI } from "@google/genai";

/**
 * Verifies the Google API key by making a small, inexpensive API call.
 * @param apiKey The Google API key.
 * @returns A boolean indicating if the key is valid.
 */
export const verifyApiKey = async (apiKey: string): Promise<boolean> => {
  if (!apiKey) return false;
  try {
    const ai = new GoogleGenAI({apiKey});
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-preview-04-17',
        contents: "Hi",
    });
    return !!(response && response.text);
  } catch (error) {
    console.error("Gemini API Key verification failed:", error);
    return false;
  }
};

/**
 * Core function to call the Gemini API.
 * @param apiKey The API key.
 * @param prompt The complete prompt to send to the model.
 * @returns The text response from the model.
 */
const getCompletion = async (apiKey: string, prompt: string): Promise<string> => {
    try {
        const ai = new GoogleGenAI({apiKey});
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-preview-04-17',
            contents: prompt,
        });

        if (response && response.text) {
            return response.text;
        } else {
            throw new Error('Invalid response structure from Gemini API.');
        }
    } catch (e: any) {
        console.error("Error calling Gemini API:", e);
        const errorMessage = e.message || 'An unknown error occurred with the Gemini API.';
        throw new Error(`Gemini API Error: ${errorMessage}`);
    }
}

/**
 * Generates an analysis of the problem statement.
 * @param apiKey The user's Google API key.
 * @param problemText The full text of the programming problem.
 * @returns The AI-generated analysis as a string.
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
 * Generates a solution for the problem based on an initial analysis.
 * @param apiKey The user's Google API key.
 * @param problemText The full text of the programming problem.
 * @param analysisText The AI-generated analysis of the problem.
 * @returns The AI-generated solution as a string.
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