/**
 * Builds a plain-text veteran context string from Supabase profile + conditions.
 * Used to personalize AI responses across VERA, nexus letters, appeals, and gap analysis.
 *
 * @param {string} userId - The Supabase user ID
 * @param {object} supabaseClient - An initialized Supabase client (sb)
 * @returns {Promise<string>} - Formatted context string, or empty string if no data
 */
async function buildVeteranContext(userId, supabaseClient) {
  if (!userId || !supabaseClient) return '';

  var profile = null;
  var conditions = [];

  try {
    var profRes = await supabaseClient.from('profiles').select('branch,mos,current_rating').eq('user_id', userId).single();
    if (profRes.data) profile = profRes.data;
  } catch (e) {}

  try {
    var condRes = await supabaseClient.from('conditions').select('name,rating,decision').eq('user_id', userId);
    if (condRes.data && condRes.data.length > 0) conditions = condRes.data;
  } catch (e) {}

  if (!profile && conditions.length === 0) return '';

  var lines = ['VETERAN PROFILE:'];
  if (profile) {
    lines.push('- Branch: ' + (profile.branch || 'Not specified'));
    lines.push('- MOS/Rate: ' + (profile.mos || 'Not specified'));
    lines.push('- Current VA Rating: ' + (profile.current_rating != null ? profile.current_rating + '%' : 'Unknown'));
  } else {
    lines.push('- No profile data available');
  }

  var rated = conditions.filter(function (c) {
    return c.decision && c.decision.toLowerCase().includes('service connected')
      && !c.decision.toLowerCase().includes('not service');
  });
  var unrated = conditions.filter(function (c) {
    return !c.decision
      || c.decision.toLowerCase().includes('deferred')
      || c.decision.toLowerCase().includes('not service')
      || c.decision.toLowerCase().includes('denied');
  });

  if (rated.length > 0) {
    lines.push('');
    lines.push('RATED CONDITIONS:');
    rated.forEach(function (c) {
      lines.push('- ' + c.name + ': ' + (c.rating || '0') + '% (' + (c.decision || 'Service Connected') + ')');
    });
  }

  if (unrated.length > 0) {
    lines.push('');
    lines.push('UNRATED/DEFERRED CONDITIONS:');
    unrated.forEach(function (c) {
      lines.push('- ' + c.name + ': ' + (c.decision || 'Unknown status'));
    });
  }

  return lines.join('\n');
}
