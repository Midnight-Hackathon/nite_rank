// Follow this setup guide to integrate the Deno language server with your editor:

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: { 'Access-Control-Allow-Origin': '*' } });
  }

  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  try {
    const body = await req.json();  // Parse the incoming JSON data
    console.log('Game data received:', body);  // Log to Supabase dashboard

    // Optional: Store in Supabase DB (uncomment and set up a 'game_logs' table)
    // const { createClient } = await import('npm:supabase-js@2');
    // const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!);
    // const { error } = await supabase.from('game_logs').insert({ data: body });
    // if (error) console.error('DB insert error:', error);

    // Return a response to the sender
    return new Response(JSON.stringify({ status: 'received', echo: body }), {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      status: 200,
    });
  } catch (error) {
    console.error('Error processing request:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
});