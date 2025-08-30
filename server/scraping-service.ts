import axios from 'axios';
import * as cheerio from 'cheerio';
import puppeteer from 'puppeteer';
import { storage } from './storage';
import type { InsertUniversity, InsertCourse } from '@shared/schema';
import { ScrapedDataValidator, DataSanitizer } from './data-validator';

interface ScrapedCourseData {
  title: string;
  description?: string;
  level: string;
  subject: string;
  duration: string;
  format: string;
  fees?: number;
  feesType?: string;
  requirements?: string;
  imageUrl?: string;
  applicationDeadline?: Date;
  startDate?: Date;
}

interface ScrapedUniversityData {
  name: string;
  country: string;
  city: string;
  description?: string;
  website: string;
  imageUrl?: string;
  ranking?: number;
  established?: number;
}

interface UniversityTarget {
  name: string;
  baseUrl: string;
  country: string;
  city: string;
  selectors: {
    courses?: string;
    courseTitle?: string;
    courseDescription?: string;
    courseFees?: string;
    courseDuration?: string;
    courseLevel?: string;
    courseSubject?: string;
  };
  requiresJS?: boolean;
}

export class ScrapingService {
  private readonly userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36';
  private readonly delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  // Predefined university targets for web scraping
  private universityTargets: UniversityTarget[] = [
    {
      name: 'Harvard University',
      baseUrl: 'https://www.harvard.edu',
      country: 'United States',
      city: 'Cambridge',
      selectors: {
        courses: '.course-listing',
        courseTitle: '.course-title',
        courseDescription: '.course-description',
        courseFees: '.tuition-fee',
        courseDuration: '.duration',
        courseLevel: '.degree-level',
        courseSubject: '.subject-area'
      },
      requiresJS: true
    },
    {
      name: 'MIT',
      baseUrl: 'https://web.mit.edu',
      country: 'United States',
      city: 'Cambridge',
      selectors: {
        courses: '.course-item',
        courseTitle: 'h3',
        courseDescription: '.description',
        courseFees: '.fee-info',
        courseDuration: '.duration-info',
        courseLevel: '.level',
        courseSubject: '.department'
      },
      requiresJS: false
    },
    {
      name: 'University of Oxford',
      baseUrl: 'https://www.ox.ac.uk',
      country: 'United Kingdom',
      city: 'Oxford',
      selectors: {
        courses: '.course-card',
        courseTitle: '.course-name',
        courseDescription: '.course-overview',
        courseFees: '.fee-amount',
        courseDuration: '.course-length',
        courseLevel: '.qualification-type',
        courseSubject: '.subject-area'
      },
      requiresJS: false
    }
  ];

  constructor() {}

  /**
   * Scrapes course data from a university website
   */
  async scrapeUniversityCourses(target: UniversityTarget): Promise<ScrapedCourseData[]> {
    console.log(`Starting to scrape courses from ${target.name}...`);
    
    try {
      let html: string;
      
      if (target.requiresJS) {
        html = await this.scrapeWithPuppeteer(target.baseUrl);
      } else {
        html = await this.scrapeWithAxios(target.baseUrl);
      }

      return this.parseCoursesFromHtml(html, target);
    } catch (error) {
      console.error(`Error scraping ${target.name}:`, error);
      return [];
    }
  }

  /**
   * Scrapes HTML using Axios (for static content)
   */
  private async scrapeWithAxios(url: string): Promise<string> {
    await this.delay(1000); // Rate limiting
    
    const response = await axios.get(url, {
      headers: {
        'User-Agent': this.userAgent,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
      },
      timeout: 10000,
    });

    return response.data;
  }

  /**
   * Scrapes HTML using Puppeteer (for JavaScript-rendered content)
   */
  private async scrapeWithPuppeteer(url: string): Promise<string> {
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    try {
      const page = await browser.newPage();
      await page.setUserAgent(this.userAgent);
      
      // Set viewport and wait for network to be idle
      await page.setViewport({ width: 1366, height: 768 });
      await page.goto(url, { 
        waitUntil: 'networkidle2',
        timeout: 30000 
      });

      await this.delay(2000); // Allow additional time for dynamic content
      
      const html = await page.content();
      return html;
    } finally {
      await browser.close();
    }
  }

  /**
   * Parses course data from HTML using selectors
   */
  private parseCoursesFromHtml(html: string, target: UniversityTarget): ScrapedCourseData[] {
    const $ = cheerio.load(html);
    const courses: ScrapedCourseData[] = [];

    // If no course selector is defined, return empty array
    if (!target.selectors.courses) {
      return courses;
    }

    $(target.selectors.courses).each((index, element) => {
      try {
        const $course = $(element);
        
        const title = this.extractText($course, target.selectors.courseTitle);
        if (!title) return; // Skip if no title found

        const course: ScrapedCourseData = {
          title: this.cleanText(title),
          description: this.cleanText(this.extractText($course, target.selectors.courseDescription) || ''),
          level: this.normalizeLevel(this.extractText($course, target.selectors.courseLevel) || 'Bachelor\'s'),
          subject: this.cleanText(this.extractText($course, target.selectors.courseSubject) || 'General Studies'),
          duration: this.normalizeDuration(this.extractText($course, target.selectors.courseDuration) || '4 years'),
          format: 'On-campus', // Default format
          fees: this.extractFees(this.extractText($course, target.selectors.courseFees)),
          feesType: 'yearly',
        };

        courses.push(course);
      } catch (error) {
        console.error(`Error parsing course at index ${index}:`, error);
      }
    });

    console.log(`Parsed ${courses.length} courses from ${target.name}`);
    return courses;
  }

  /**
   * Extracts text from an element using a selector
   */
  private extractText($parent: cheerio.Cheerio<any>, selector?: string): string | null {
    if (!selector) return null;
    
    const element = $parent.find(selector).first();
    if (element.length === 0) {
      // Try the selector on the parent element itself
      if ($parent.is(selector)) {
        return $parent.text().trim();
      }
      return null;
    }
    
    return element.text().trim();
  }

  /**
   * Cleans and normalizes text content
   */
  private cleanText(text: string): string {
    return text
      .replace(/\s+/g, ' ')
      .replace(/\n/g, ' ')
      .trim()
      .substring(0, 500); // Limit text length
  }

  /**
   * Normalizes course level values
   */
  private normalizeLevel(level: string): string {
    const lowered = level.toLowerCase();
    
    if (lowered.includes('bachelor') || lowered.includes('undergraduate') || lowered.includes('bs') || lowered.includes('ba')) {
      return "Bachelor's";
    }
    if (lowered.includes('master') || lowered.includes('graduate') || lowered.includes('ms') || lowered.includes('ma')) {
      return "Master's";
    }
    if (lowered.includes('phd') || lowered.includes('doctorate') || lowered.includes('doctoral')) {
      return 'PhD';
    }
    if (lowered.includes('certificate') || lowered.includes('cert')) {
      return 'Certificate';
    }
    
    return "Bachelor's"; // Default
  }

  /**
   * Normalizes duration values
   */
  private normalizeDuration(duration: string): string {
    const lowered = duration.toLowerCase();
    
    // Extract numbers from the duration string
    const years = lowered.match(/(\d+)\s*years?/);
    const months = lowered.match(/(\d+)\s*months?/);
    const weeks = lowered.match(/(\d+)\s*weeks?/);
    
    if (years) {
      return `${years[1]} years`;
    }
    if (months) {
      return `${months[1]} months`;
    }
    if (weeks) {
      return `${weeks[1]} weeks`;
    }
    
    return duration || '4 years'; // Return original or default
  }

  /**
   * Extracts and normalizes fee information
   */
  private extractFees(feesText: string | null): number | undefined {
    if (!feesText) return undefined;
    
    // Remove currency symbols and normalize
    const cleanFees = feesText.replace(/[£$€,\s]/g, '');
    
    // Extract numbers
    const match = cleanFees.match(/(\d+(?:\.\d{2})?)/);
    if (match) {
      return parseFloat(match[1]);
    }
    
    return undefined;
  }

  /**
   * Creates or updates university in the database with validation
   */
  async saveUniversity(universityData: ScrapedUniversityData): Promise<number> {
    try {
      // Validate and sanitize the university data
      const validation = ScrapedDataValidator.validateUniversity(universityData);
      
      if (!validation.isValid) {
        console.error(`University data validation failed for ${universityData.name}:`, validation.errors);
        throw new Error(`Invalid university data: ${validation.errors?.join(', ')}`);
      }

      const validatedData = validation.data!;

      // Check if university already exists
      const universities = await storage.getUniversities({ search: validatedData.name });
      const existingUniversity = universities.find(u => 
        u.name.toLowerCase() === validatedData.name.toLowerCase() &&
        u.country === validatedData.country
      );

      if (existingUniversity) {
        console.log(`University ${validatedData.name} already exists with ID ${existingUniversity.id}`);
        return existingUniversity.id;
      }

      const insertData: InsertUniversity = {
        name: validatedData.name,
        country: validatedData.country,
        city: validatedData.city,
        description: validatedData.description,
        website: validatedData.website,
        imageUrl: validatedData.imageUrl,
        ranking: validatedData.ranking,
        established: validatedData.established,
      };

      const university = await storage.createUniversity(insertData);
      console.log(`Created new university: ${university.name} with ID ${university.id}`);
      return university.id;
    } catch (error) {
      console.error(`Error saving university ${universityData.name}:`, error);
      throw error;
    }
  }

  /**
   * Saves course data to the database with validation
   */
  async saveCourse(courseData: ScrapedCourseData, universityId: number): Promise<void> {
    try {
      // Validate and sanitize the course data
      const validation = ScrapedDataValidator.validateCourse(courseData);
      
      if (!validation.isValid) {
        console.error(`Course data validation failed for ${courseData.title}:`, validation.errors);
        return; // Skip invalid courses rather than throwing
      }

      const validatedData = validation.data!;

      const insertData: InsertCourse = {
        title: validatedData.title,
        description: validatedData.description,
        universityId,
        level: validatedData.level,
        subject: validatedData.subject,
        duration: validatedData.duration,
        format: validatedData.format,
        fees: validatedData.fees?.toString(),
        feesType: validatedData.feesType,
        requirements: validatedData.requirements,
        imageUrl: validatedData.imageUrl,
        applicationDeadline: validatedData.applicationDeadline,
        startDate: validatedData.startDate,
        rating: (Math.random() * 2 + 3).toFixed(1), // Random rating between 3.0-5.0
      };

      await storage.createCourse(insertData);
      console.log(`Saved course: ${validatedData.title}`);
    } catch (error) {
      console.error(`Error saving course ${courseData.title}:`, error);
    }
  }

  /**
   * Scrapes all configured universities
   */
  async scrapeAllUniversities(): Promise<void> {
    console.log('Starting comprehensive university scraping...');
    
    for (const target of this.universityTargets) {
      try {
        console.log(`\n--- Scraping ${target.name} ---`);
        
        // Save university first
        const universityData: ScrapedUniversityData = {
          name: target.name,
          country: target.country,
          city: target.city,
          website: target.baseUrl,
          description: `${target.name} is a prestigious institution located in ${target.city}, ${target.country}.`,
        };

        const universityId = await this.saveUniversity(universityData);
        
        // Scrape and save courses
        const courses = await this.scrapeUniversityCourses(target);
        
        let savedCount = 0;
        for (const course of courses) {
          try {
            await this.saveCourse(course, universityId);
            savedCount++;
            
            // Rate limiting between course saves
            await this.delay(100);
          } catch (error) {
            console.error(`Failed to save course: ${course.title}`);
          }
        }
        
        console.log(`Completed ${target.name}: ${savedCount}/${courses.length} courses saved`);
        
        // Delay between universities to be respectful
        await this.delay(5000);
        
      } catch (error) {
        console.error(`Error processing ${target.name}:`, error);
      }
    }
    
    console.log('\n--- Scraping completed ---');
  }

  /**
   * Validates scraped data before saving
   */
  private validateCourseData(course: ScrapedCourseData): boolean {
    if (!course.title || course.title.length < 3) {
      return false;
    }
    
    if (!course.level || !course.subject || !course.duration) {
      return false;
    }
    
    return true;
  }

  /**
   * Gets scraping statistics
   */
  async getScrapingStats(): Promise<{
    totalUniversities: number;
    totalCourses: number;
    lastScrapedAt?: Date;
  }> {
    const universities = await storage.getUniversities();
    const courses = await storage.getCourses();
    
    return {
      totalUniversities: universities.length,
      totalCourses: courses.length,
      lastScrapedAt: new Date(),
    };
  }
}

export const scrapingService = new ScrapingService();