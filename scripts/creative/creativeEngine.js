import { WebsiteAdapter } from '../website/websiteAdapter.js';

export class CreativeEngine {
  constructor() {
    this.websiteAdapter = new WebsiteAdapter();
  }

  generateContentId(dateStr = new Date(), sequence = 1) {
    const d = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    const seq = String(sequence).padStart(3, '0');
    return `WC-${yyyy}-${mm}-${dd}-${seq}`;
  }

  buildCarouselPost(winningConcept, contentId) {
    const utmUrl = this.websiteAdapter.buildUtmUrl(winningConcept.productId, contentId);
    const product = this.websiteAdapter.getProduct(winningConcept.productId);

    const slides = [
      {
        slideNumber: 1,
        headline: winningConcept.hook,
        subtext: 'Swipe to see 3 easy screen-free ideas your little explorer will love 🐾',
        visualLayout: 'Cover Card: Warm Cream background, Forest Green title, playful paw print badge',
        type: 'hook_slide'
      },
      {
        slideNumber: 2,
        headline: 'Why evening screen fatigue happens',
        subtext: 'After a long day, children crave sensory engagement and connection, not just flashing pixels.',
        visualLayout: 'Split Card: Minimal illustration of calm bedtime routine vs frantic screen stimulation',
        type: 'problem_context'
      },
      {
        slideNumber: 3,
        headline: 'Game 1: The Jungle Animal Sound Match 🦁',
        subtext: 'Make a lion roar or elephant trumpet. Have your little explorer guess the animal and act out its walk!',
        visualLayout: 'Step Card: Illustration of Lion and Elephant with simple instruction icon',
        type: 'actionable_step'
      },
      {
        slideNumber: 4,
        headline: 'Game 2: The "As Big As..." Living Room Hunt 📏',
        subtext: 'Did you know a baby tiger is as big as a cereal box? Find 3 things in your room the same size!',
        visualLayout: 'Step Card: Size comparison ruler graphic with tiger cub silhouette',
        type: 'actionable_step'
      },
      {
        slideNumber: 5,
        headline: 'Game 3: Mystery Animal Footprints 🐾',
        subtext: 'Draw 3 simple animal paw shapes on scrap paper. Can they track which animal left them?',
        visualLayout: 'Step Card: Footprint maze illustration',
        type: 'actionable_step'
      },
      {
        slideNumber: 6,
        headline: 'Earn the Official Explorer Badge 🏅',
        subtext: 'When kids finish an activity, celebrating their curiosity builds lifelong learning confidence.',
        visualLayout: 'Achievement Card: Gold badge graphic "Official Junior Jungle Explorer"',
        type: 'payoff_badge'
      },
      {
        slideNumber: 7,
        headline: 'Ready for 60 real animal adventures?',
        subtext: 'Download the complete Jungle Safari printable bundle (Volumes 1–3) + Free Coloring Book for just $13.99!',
        visualLayout: 'Call to Action Card: 3-book bundle mockup with "Instant PDF Download" banner',
        type: 'cta_slide',
        linkText: 'Tap link in bio to download & print today'
      }
    ];

    const caption = [
      winningConcept.hook + ' 👇',
      '',
      'When 5 PM hits and the energy in the house is chaotic, it is so tempting to just hand over a tablet. But often, little explorers just need 10 minutes of hands-on discovery to reset.',
      '',
      'Here are 3 screen-free animal games you can play tonight with zero prep:',
      '1️⃣ Jungle Animal Sound Match (roar, trumpet & mimic)',
      '2️⃣ "As Big As..." Living Room Hunt (finding items the size of real baby animals)',
      '3️⃣ Mystery Paw Footprint Detective',
      '',
      `🐾 Want 60 real animals, fun quizzes, and 3 printable explorer badges? Check out our Jungle Safari Adventure bundle at the link in bio (${product.url}). Instant download, print at home!`,
      '',
      '👉 Save this post for your next busy evening!',
      '',
      '#screenfreekids #screenfreeactivities #toddleractivities #learningthroughplay #parentingtips #thewondercub #junglesafari #earlychildhood'
    ].join('\n');

    return {
      contentId,
      ideaId: winningConcept.id,
      pillar: winningConcept.pillar,
      format: winningConcept.format,
      hook: winningConcept.hook,
      caption,
      productId: winningConcept.productId,
      url: product.url,
      utmUrl,
      mediaAssets: slides,
      growthScore: winningConcept.growthScore,
      salesScore: winningConcept.salesScore,
      compositeScore: winningConcept.compositeScore,
      status: 'DRAFT',
      createdAt: new Date().toISOString()
    };
  }
}
