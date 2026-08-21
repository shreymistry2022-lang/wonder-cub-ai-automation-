export class QualityChecker {
  constructor() {
    this.forbiddenPhrases = [
      'hurry before it\'s gone',
      'secret hack',
      'doctors don\'t want you to know',
      'only 2 left in stock',
      'guaranteed genius child',
      '100% cure for tantrums',
      'cure your child\'s behavior'
    ];

    this.trademarkedCharacters = [
      'disney',
      'paw patrol',
      'peppa pig',
      'cocomelon',
      'bluey',
      'pokemon',
      'marvel',
      'mickey mouse',
      'elsa',
      'frozen'
    ];
  }

  evaluatePost(post) {
    const flags = [];
    const textToScan = `${post.hook} ${post.caption} ${JSON.stringify(post.mediaAssets || [])}`.toLowerCase();

    // 1. IP / Trademark checks
    for (const tm of this.trademarkedCharacters) {
      if (textToScan.includes(tm)) {
        flags.push(`IP Warning: Found unauthorized reference to trademarked entity "${tm}"`);
      }
    }

    // 2. Forbidden phrases
    for (const phrase of this.forbiddenPhrases) {
      if (textToScan.includes(phrase)) {
        flags.push(`Brand Voice Warning: Found aggressive marketing phrase "${phrase}"`);
      }
    }

    // 3. Price & Product Check
    if (textToScan.includes('$') && !textToScan.includes('13.99') && !textToScan.includes('9.99')) {
      flags.push('Pricing Warning: Found unverified price mention. Only verified prices are $13.99 (bundle) and $9.99 (bonus value).');
    }

    // 4. URL Validation
    if (post.url && !post.url.startsWith('https://thewondercub.store')) {
      flags.push(`URL Warning: Destination URL "${post.url}" does not belong to the official store domain.`);
    }

    // 5. Structure Completeness
    if (!post.hook || post.hook.length < 10) {
      flags.push('Structural Warning: Hook is too short or missing.');
    }
    if (!post.caption || post.caption.length < 50) {
      flags.push('Structural Warning: Caption is too brief or incomplete.');
    }
    if (!post.mediaAssets || post.mediaAssets.length === 0) {
      flags.push('Media Warning: No slide or video assets provided in post draft.');
    }

    const passed = flags.length === 0;
    const ipRiskScore = flags.some(f => f.startsWith('IP Warning')) ? 0.9 : 0.0;

    return {
      passed,
      flags,
      ipRiskScore,
      evaluatedAt: new Date().toISOString()
    };
  }
}
