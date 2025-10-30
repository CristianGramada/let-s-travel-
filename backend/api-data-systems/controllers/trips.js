const supabase = require('../supabase');

const getAllTrips = async (req, res) => {
    try {
        const { data: trips, error } = await supabase
            .from('trips')
            .select(`
                *,
                users:user_id (
                    id,
                    name,
                    email
                )
            `)
            .order('id');

        if (error) {
            console.error('Supabase error:', error);
            return res.status(500).send({ error: 'Failed to fetch trips' });
        }

        res.status(200).json(trips);
    } catch (err) {
        console.error(err);
        res.status(500).send({ error: 'Internal server error' });
    }
}

const createTrip = async (req, res) => {
    try {
        const { user_id, destination, start_date, end_date, description } = req.body;

        // Validate required fields
        if (!user_id || !destination || !start_date || !end_date) {
            return res.status(400).send({ 
                error: 'user_id, destination, start_date, and end_date are required' 
            });
        }

        // Verify that the user exists (foreign key validation)
        const { data: user, error: userError } = await supabase
            .from('users')
            .select('id')
            .eq('id', user_id)
            .single();

        if (userError || !user) {
            return res.status(400).send({ error: 'Invalid user_id - user does not exist' });
        }

        // Create the trip
        const { data: newTrip, error } = await supabase
            .from('trips')
            .insert([{
                user_id,
                destination,
                start_date,
                end_date,
                description
            }])
            .select(`
                *,
                users:user_id (
                    id,
                    name,
                    email
                )
            `)
            .single();

        if (error) {
            console.error('Supabase error:', error);
            return res.status(500).send({ error: 'Failed to create trip' });
        }

        res.status(201).json(newTrip);
    } catch (err) {
        console.error(err);
        res.status(500).send({ error: 'Internal server error' });
    }
}

const getTripById = async (req, res) => {
    try {
        const { id } = req.params;

        // Validate ID is a number
        if (isNaN(id)) {
            return res.status(400).send({ error: 'Invalid trip ID' });
        }

        const { data: trip, error } = await supabase
            .from('trips')
            .select(`
                *,
                users:user_id (
                    id,
                    name,
                    email
                ),
                itineraries (
                    id,
                    day_number,
                    activity,
                    location,
                    start_time,
                    end_time,
                    notes
                )
            `)
            .eq('id', id)
            .single();

        if (error) {
            console.error('Supabase error:', error);
            
            if (error.code === 'PGRST116') {
                return res.status(404).send({ error: `No trip found with id ${id}` });
            }
            
            return res.status(500).send({ error: 'Failed to fetch trip' });
        }

        res.status(200).json(trip);
    } catch (err) {
        console.error(err);
        res.status(500).send({ error: 'Internal server error' });
    }
}

const getTripsByUserId = async (req, res) => {
    try {
        const { userId } = req.params;

        // Validate user ID is a number
        if (isNaN(userId)) {
            return res.status(400).send({ error: 'Invalid user ID' });
        }

        const { data: trips, error } = await supabase
            .from('trips')
            .select(`
                *,
                users:user_id (
                    id,
                    name,
                    email
                )
            `)
            .eq('user_id', userId)
            .order('start_date');

        if (error) {
            console.error('Supabase error:', error);
            return res.status(500).send({ error: 'Failed to fetch user trips' });
        }

        res.status(200).json(trips);
    } catch (err) {
        console.error(err);
        res.status(500).send({ error: 'Internal server error' });
    }
}

module.exports = {
    getAllTrips,
    createTrip,
    getTripById,
    getTripsByUserId
}