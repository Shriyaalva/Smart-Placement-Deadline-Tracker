export class EmailParserService {
  private placementKeywords = [
    'placement', 'internship', 'job', 'career', 'opportunity', 'hiring', 'recruit',
    'application', 'apply', 'position', 'opening', 'vacancy', 'campus', 'graduate',
    'fresher', 'entry level', 'new grad', 'software engineer', 'developer',
    'data scientist', 'analyst', 'consultant', 'trainee', 'associate'
  ];

  private deadlineKeywords = [
    'deadline', 'due', 'apply by', 'application closes', 'last date',
    'expires', 'close', 'ends', 'final date', 'submit by', 'before'
  ];

  private companyDomains = [
    'google.com', 'microsoft.com', 'amazon.com', 'apple.com', 'meta.com',
    'netflix.com', 'uber.com', 'airbnb.com', 'spotify.com', 'twitter.com',
    'linkedin.com', 'salesforce.com', 'oracle.com', 'ibm.com', 'adobe.com'
  ];

  isPlacementRelated(subject: string, from: string, body: string): boolean {
    const content = `${subject} ${body}`.toLowerCase();
    const fromDomain = from.toLowerCase();

    // Check if email is from a known company domain
    const isFromCompany = this.companyDomains.some(domain => fromDomain.includes(domain));
    
    // Check if content contains placement-related keywords
    const hasPlacementKeywords = this.placementKeywords.some(keyword => 
      content.includes(keyword.toLowerCase())
    );

    // Check for common recruitment email patterns
    const hasRecruitmentPatterns = [
      'career', 'hr', 'talent', 'recruitment', 'jobs', 'campus'
    ].some(pattern => fromDomain.includes(pattern));

    return isFromCompany || hasPlacementKeywords || hasRecruitmentPatterns;
  }

  extractDeadline(subject: string, body: string): { deadline: Date | null, extractedText: string | null } {
    const content = `${subject} ${body}`;
    
    // Common date patterns
    const datePatterns = [
      // MM/DD/YYYY or DD/MM/YYYY
      /\b(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})\b/g,
      // Month DD, YYYY
      /\b(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{1,2}),?\s+(\d{4})\b/gi,
      // DD Month YYYY
      /\b(\d{1,2})\s+(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{4})\b/gi,
      // Month DD
      /\b(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{1,2})\b/gi,
    ];

    let extractedText = null;
    let deadline = null;

    // Look for deadline context
    for (const keyword of this.deadlineKeywords) {
      const regex = new RegExp(`${keyword}[^.]*`, 'gi');
      const matches = content.match(regex);
      
      if (matches) {
        for (const match of matches) {
          extractedText = match.trim();
          
          // Try to extract date from the matched text
          for (const pattern of datePatterns) {
            const dateMatch = match.match(pattern);
            if (dateMatch) {
              const parsedDate = this.parseDate(dateMatch[0]);
              if (parsedDate && parsedDate > new Date()) {
                deadline = parsedDate;
                break;
              }
            }
          }
          
          if (deadline) break;
        }
      }
      
      if (deadline) break;
    }

    // If no deadline found in context, look for any date in the content
    if (!deadline) {
      for (const pattern of datePatterns) {
        const matches = content.match(pattern);
        if (matches) {
          for (const match of matches) {
            const parsedDate = this.parseDate(match);
            if (parsedDate && parsedDate > new Date()) {
              deadline = parsedDate;
              extractedText = match;
              break;
            }
          }
        }
        if (deadline) break;
      }
    }

    return { deadline, extractedText };
  }

  private parseDate(dateString: string): Date | null {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return null;
      }
      return date;
    } catch {
      return null;
    }
  }

  extractCompanyName(from: string, subject: string, body: string): string {
    // Try to extract company name from email domain
    const emailMatch = from.match(/@([^.]+)/);
    if (emailMatch) {
      const domain = emailMatch[1];
      // Capitalize first letter
      return domain.charAt(0).toUpperCase() + domain.slice(1);
    }

    // Try to extract from subject line
    const subjectWords = subject.split(' ');
    for (const word of subjectWords) {
      if (word.length > 3 && /^[A-Z]/.test(word)) {
        return word;
      }
    }

    // Try to extract from body
    const bodyWords = body.split(' ').slice(0, 50); // Only check first 50 words
    for (const word of bodyWords) {
      if (word.length > 3 && /^[A-Z]/.test(word) && !this.isCommonWord(word)) {
        return word;
      }
    }

    return 'Unknown Company';
  }

  private isCommonWord(word: string): boolean {
    const commonWords = [
      'Dear', 'Hello', 'Hi', 'The', 'This', 'That', 'We', 'You', 'Your',
      'Our', 'From', 'To', 'Subject', 'Date', 'Time', 'Place', 'Team'
    ];
    return commonWords.includes(word);
  }

  extractApplicationUrl(body: string): string | null {
    const urlPattern = /https?:\/\/[^\s<>"']+/g;
    const urls = body.match(urlPattern);
    
    if (urls) {
      // Look for URLs that likely lead to application pages
      const applicationUrls = urls.filter(url => {
        const lowerUrl = url.toLowerCase();
        return lowerUrl.includes('apply') || 
               lowerUrl.includes('application') || 
               lowerUrl.includes('career') || 
               lowerUrl.includes('job') ||
               lowerUrl.includes('recruit');
      });
      
      return applicationUrls[0] || urls[0];
    }
    
    return null;
  }
}

export const emailParserService = new EmailParserService();
