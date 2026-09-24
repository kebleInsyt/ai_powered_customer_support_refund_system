/**
 * Security Guard Service: Prompt Injection & Adversarial Input Detection
 *
 * Provides layered defense against jailbreak attempts and prompt injection:
 * 1. Heuristic pattern scanning for known jailbreak/override signatures.
 * 2. Delimiter containment (strips raw XML/system tags so user cannot close prompt context).
 * 3. Structured boundary encapsulation (<customer_untrusted_input>).
 */

export interface SecurityCheckResult {
  isSuspicious: boolean;
  detectedPatterns: string[];
  sanitizedText: string;
}

// Known prompt injection / jailbreak markers
const INJECTION_PATTERNS = [
  /ignore\s+(all\s+)?(previous|prior)\s+(instructions|prompts|rules)/i,
  /disregard\s+(all\s+)?(previous|prior)\s+(instructions|rules)/i,
  /forget\s+(all\s+)?(previous|prior)\s+(instructions|rules)/i,
  /system\s+override/i,
  /admin\s+(override|mode|access)/i,
  /you\s+are\s+now\s+(in\s+developer\s+mode|dan|unrestricted)/i,
  /dan\s+mode/i,
  /jailbreak/i,
  /new\s+system\s+directive/i,
  /bypass\s+policy/i,
  /approve\s+this\s+refund\s+no\s+matter\s+what/i,
  /force\s+approve/i,
  /act\s+as\s+a\s+system\s+administrator/i,
  /do\s+not\s+follow\s+the\s+policy/i,
];

export class SecurityGuard {
  /**
   * Scans user input for prompt injection signatures and sanitizes dangerous tags.
   */
  public static inspectInput(input: string): SecurityCheckResult {
    const detectedPatterns: string[] = [];
    const normalized = input.trim();

    // Scan for known prompt injection phrases
    for (const pattern of INJECTION_PATTERNS) {
      if (pattern.test(normalized)) {
        detectedPatterns.push(pattern.source);
      }
    }

    // Check for XML/HTML tag breakout attempts
    if (/<(\/)?(system|policy|context|instruction|admin)/i.test(normalized)) {
      detectedPatterns.push('DELIMITER_INJECTION_ATTEMPT');
    }

    // Sanitize text by stripping angle brackets to prevent prompt formatting breakout
    const sanitizedText = normalized
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/[\u0000-\u001F\u007F-\u009F]/g, ''); // strip non-printable ASCII control characters

    return {
      isSuspicious: detectedPatterns.length > 0,
      detectedPatterns,
      sanitizedText,
    };
  }

  /**
   * Encapsulates customer message in isolated XML delimiters with clear system instructions.
   */
  public static wrapCustomerInput(sanitizedText: string): string {
    return `<customer_untrusted_input>\n${sanitizedText}\n</customer_untrusted_input>`;
  }
}
