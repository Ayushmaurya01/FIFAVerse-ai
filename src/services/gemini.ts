import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini API client if API key is provided
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';
let genAI: GoogleGenerativeAI | null = null;

if (API_KEY && API_KEY !== 'YOUR_GEMINI_API_KEY') {
  try {
    genAI = new GoogleGenerativeAI(API_KEY);
  } catch (error) {
    console.error('Failed to initialize Gemini API client:', error);
  }
}

// System prompt to set context for the real Gemini API
const SYSTEM_INSTRUCTIONS = `
You are the FIFAVerse AI Operations Assistant for the FIFA World Cup 2026.
You assist fans, volunteers, venue organizers, and emergency staff with stadium navigation, crowd predictions, transport schedules, accessibility assistance, translation, and emergency evacuations.
Be professional, concise, and prioritize safety and accessibility.
`;

/**
 * Call Gemini API or fallback to mock simulation
 */
export async function getGeminiResponse(prompt: string, contextType: string = 'general'): Promise<string> {
  let responseText = '';

  if (genAI) {
    try {
      const model = genAI.getGenerativeModel({
        model: 'gemini-1.5-flash',
        generationConfig: { maxOutputTokens: 500, temperature: 0.4 },
      });
      
      const fullPrompt = `${SYSTEM_INSTRUCTIONS}\n[Context: ${contextType}]\nQuery: ${prompt}`;
      const result = await model.generateContent(fullPrompt);
      const response = await result.response;
      responseText = response.text() || 'No response generated.';
    } catch (error) {
      console.warn('Gemini API call failed, falling back to local operations engine:', error);
      responseText = await simulateOperationsAiAsync(prompt, contextType);
    }
  } else {
    responseText = await simulateOperationsAiAsync(prompt, contextType);
  }

  // Strip all markdown bold/italic asterisks to render clean plain text in whitespace-pre-line boxes
  return responseText.replace(/\*/g, '');
}

function simulateOperationsAiAsync(prompt: string, contextType: string): Promise<string> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(simulateOperationsAI(prompt, contextType));
    }, 800); // Simulate API latency
  });
}

/**
 * Intelligent Mock Operations Engine
 * Mimics complex operations decision-making
 */
function simulateOperationsAI(prompt: string, contextType: string): string {
  const query = prompt.toLowerCase();

  switch (contextType) {
    case 'navigation':
      if (query.includes('wheelchair') || query.includes('accessible')) {
        return `♿ **Accessible Route Active:** Ramps are available at Gate A and D. Take Elevator 3 near Section 102 to reach Row 12 directly. Path is completely step-free and avoids the high-traffic corridor behind the main food court.
- **Estimated Travel Time:** 4.5 minutes.
- **Crowd Level:** Low (15% density).`;
      }
      if (query.includes('parking') || query.includes('gate')) {
        return `🚗 **Gate & Parking Recommendation:** 
For Section 204, the fastest entrance is **Gate C**. 
- **Route:** From Parking Lot B (Blue zone), take the North Perimeter walkway. Proceed to security checkpoint C-2 (average wait: 3 mins).
- **Alternative:** Gate D has slightly less traffic, adding 1.5 minutes walking but avoiding queues entirely.`;
      }
      return `🚶 **Optimal Route Found:** 
- **Path:** Head East along the Level 1 concourse, turn right at the main merchandise store, and take Stairwell 6 to Level 2.
- **Fastest Route:** 3 mins (crowded).
- **Low Crowd Route:** 5 mins (avoids Food Court congestion).`;

    case 'crowd':
      if (query.includes('halftime') || query.includes('predict') || query.includes('busy')) {
        return `📊 **Crowd Intelligence Forecast (Next 15-45 minutes):**
- **Congestion Alert:** Gate 4 and the adjacent Food Court (South Concourse) are projected to reach **92% density (Red)** within 10 minutes due to the upcoming halftime whistle.
- **Restrooms:** Section 112 facilities will experience queue times up to **14 minutes**. We recommend using Section 118 facilities (current wait: 2 mins).
- **Organizers Note:** Dispatch 3 volunteers to Gate 4 immediately to set up queue filters and guide fans to overflow gates.`;
      }
      return `🟢 **Stadium Density Status:** Concourse sections are currently at **45% overall capacity**. Gates A & B are clear. Minor queuing at Gate D ticket scanning (approx. 4 mins wait).`;

    case 'transport':
      if (query.includes('metro') || query.includes('subway')) {
        return `🚇 **Metro Operations Recommendation:** 
Metro Line 1 (Metropolitan Station) is operating at high capacity. Trains are arriving every 3 minutes.
- **Queue Time:** 15 minutes at the stadium terminal platform.
- **CO₂ Savings:** 1.8kg compared to taxi.
- **AI Advice:** Wait 15 minutes in the Stadium Plaza fan zone before boarding, or walk to the North Gate Shuttle station (Bus Line 12) which is currently uncrowded.`;
      }
      if (query.includes('taxi') || query.includes('rideshare')) {
        return `🚕 **Rideshare & Taxi Operations:** 
Rideshare pickup zone is at **Lot G**. High demand surcharge is currently active (+15% fare).
- **Travel Time:** 32 mins to Downtown (due to traffic on Express Lane 2).
- **AI Recommendation:** The Express Shuttle Bus to downtown runs via dedicated lanes (Travel time: 20 mins, Cost: $5 vs $45 rideshare).`;
      }
      return `🚌 **AI Smart Commute Recommendation:** 
1. **First Choice:** Metro Line 1 (Fastest, High Sustainability, 22 mins, $3.00, CO₂ saved: 2.1kg).
2. **Alternative:** Express Bus 4 (Direct route to West Plaza, 28 mins, $2.50, low crowd).`;

    case 'accessibility':
      return `🗣️ **Accessibility AI Assistant System:**
- **Visual Aid:** Font size adjusted. Screen reader hints activated on layout.
- **Wheelchair Assist:** Elevators 1 & 4 have priority booking for wheelchair users. Press the Assist button in the app to notify nearby volunteers.
- **Audio Feedback:** "To reach Section 105, proceed straight for 30 meters. Turn left at the Medical Point. Ramps will be on your right."`;

    case 'translation':
      if (query.includes('spanish') || query.includes('espanol') || query.includes('hola')) {
        return `¡Hola! Bienvenido a FIFAVerse AI. ¿Cómo puedo ayudarte hoy con la navegación del estadio, el transporte o la asistencia en el estadio?`;
      }
      if (query.includes('french') || query.includes('francais')) {
        return `Bonjour! Bienvenue sur FIFAVerse AI. Comment puis-je vous aider aujourd'hui pour la navigation dans le stade, les transports ou la sécurité ?`;
      }
      if (query.includes('portuguese') || query.includes('portugues')) {
        return `Olá! Bem-vindo ao FIFAVerse AI. Como posso ajudar você hoje com navegação, transporte ou segurança no estádio?`;
      }
      if (query.includes('arabic') || query.includes('العربية')) {
        return `مرحباً بك في FIFAVerse AI. كيف يمكنني مساعدتك اليوم في التنقل، أو النقل، أو خدمات الملعب؟`;
      }
      if (query.includes('hindi') || query.includes('नमस्ते')) {
        return `नमस्ते! FIFAVerse AI में आपका स्वागत है। आज मैं स्टेडियम नेविगेशन, परिवहन या सुरक्षा के साथ आपकी क्या सहायता कर सकता हूँ?`;
      }
      return `Welcome to FIFAVerse AI. I can assist you in English, Español, Français, Português, العربية, and Hindi. Type your question or switch languages above.`;

    case 'emergency':
      if (query.includes('medical') || query.includes('heart') || query.includes('hurt')) {
        return `🚨 **CRITICAL MEDICAL EMERGENCY RESPONSE:**
- **Action:** First Aid responder dispatched to your GPS location.
- **Nearest Medical Station:** Sector 2 (Directly opposite Section 108, Level 1 Concourse).
- **Safe Path:** Follow the green emergency markings on the floor. Avoid Concourse corridor B which has high congestion. 
- **Instructions:** Place the patient in a recovery position. A volunteer wearing a yellow vest is heading to you now.`;
      }
      if (query.includes('fire') || query.includes('smoke')) {
        return `🔥 **FIRE ALARM ACTIVATED - SAFETY PROTOCOL:**
- **Evacuation Gate:** Proceed immediately to **Gate F** (East Outflow).
- **Evacuation Route:** Walk down Stairwell 3. Do NOT use the elevators. The path is clear of smoke.
- **Assembly Area:** Stadium Parking Lot F (Green Safety Zone).
- **Emergency Broadcast:** Operational staff have been notified. Fire suppression systems are active in Sector 4.`;
      }
      if (query.includes('lost') || query.includes('child')) {
        return `👶 **LOST CHILD RESPONSE TRIGGERED:**
- **Action:** Child description uploaded to the Volunteer Network. 
- **Procedure:** Please remain at your current location. A security guard and a volunteer supervisor are en route to your coordinates.
- **Safe Zone:** The nearest Child Care & Information Hub is located at **Section 114** (Level 1).`;
      }
      return `🚨 **EMERGENCY EVACUATION ACTIVE:**
- **Evacuation Path:** Walk calmly to the nearest exit: **Gate A (North)** or **Gate D (South)**.
- **Directives:** Follow the illuminated floor arrows. Keep move flow steady. Do NOT stop to collect personal belongings. Security personnel are guiding the crowds.`;

    case 'volunteer':
      if (query.includes('lost child')) {
        return `📋 **VOLUNTEER SOP - LOST CHILD HANDLING:**
1. **Calm the child:** Keep them with you at your assigned station. Do NOT walk around looking for parents.
2. **Report:** Use this portal's report button. State child's name, approximate age, clothing, and current section.
3. **Notify Security:** Inform the nearest sector supervisor.
4. **Transfer:** Wait for Security Team or the child's parents. Transfer only to official personnel at Section 114 Hub.`;
      }
      if (query.includes('crowd') || query.includes('queue')) {
        return `📋 **VOLUNTEER SOP - CROWD CONGESTION CONTROL:**
1. **Deploy Guide Barriers:** Set up separation belts to create zigzag lines.
2. **Redirect Fans:** Inform fans that Gate C has 12 minutes shorter wait times than Gate B.
3. **Keep Walkways Clear:** Gently ask fans not to stand in the exit corridors.
4. **Report updates:** Mark crowd status as yellow/red in the operations app.`;
      }
      return `📋 **VOLUNTEER ASSIST:**
- **Stadium Info:** Restrooms are located every 2 sections. Medical points are at Section 108, 124, and 212.
- **SOP List:** Type "lost child", "medical incident", or "evacuation procedure" for immediate official protocols.`;

    case 'organizer':
      return `💡 **AI ORGANIZER DECISION RECOMMENDATIONS:**
1. **Congestion Risk:** Crowd density at Gate 4 is 88%. *Action:* Authorize redirect signs to Gate 3 immediately.
2. **Volunteer Resource Allocation:** 5 volunteers are currently idle in Sector 1. *Action:* Reassign them to Concourse 2 food court to clear queues.
3. **Energy Efficiency:** Smart grid reports air conditioning overload in Executive Suite Section 5. *Action:* Adjust thermostat to 23°C (saves 14% energy grid load).`;

    case 'sustainability':
      return `🌱 **SUSTAINABILITY METRICS INTEGRATION:**
- **Carbon Offset:** By promoting public transit, we have reduced game-day emissions by 4.2 tons of CO₂ today.
- **Digital Impact:** 98.4% digital tickets parsed, saving approximately 42,000 paper printouts.
- **Waste Reduction:** Reusable cup collection stands are at 84% capacity. Inform recycling teams.`;

    default:
      return `🤖 **FIFAVerse AI Co-pilot:** I am ready to assist. You can ask me about stadium routes, public transit, accessibility services, and emergency evacuations.`;
  }
}
