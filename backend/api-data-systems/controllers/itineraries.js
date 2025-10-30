const supabase = require('../supabase');

const getAllItineraries = async (req, res) => {
    try {
        const { data: itineraries, error } = await supabase
            .from('itineraries')
            .select(`
                *,
                trips:trip_id (
                    id,
                    destination,
                    start_date,
                    end_date,
                    users:user_id (
                        id,
                        name,
                        email
                    )
                )
            `)
            .order('trip_id', { ascending: true })
            .order('day_number', { ascending: true });

        if (error) {
            console.error('Supabase error:', error);
            return res.status(500).send({ error: 'Failed to fetch itineraries' });
        }

        res.status(200).json(itineraries);
    } catch (err) {
        console.error(err);
        res.status(500).send({ error: 'Internal server error' });
    }
}

const createItinerary = async (req, res) => {
    try {
        const { trip_id, day_number, activity, location, start_time, end_time, notes } = req.body;

        // Validate required fields
        if (!trip_id || !day_number || !activity || !location) {
            return res.status(400).send({ 
                error: 'trip_id, day_number, activity, and location are required' 
            });
        }

        // Verify that the trip exists (foreign key validation)
        const { data: trip, error: tripError } = await supabase
            .from('trips')
            .select('id')
            .eq('id', trip_id)
            .single();

        if (tripError || !trip) {
            return res.status(400).send({ error: 'Invalid trip_id - trip does not exist' });
        }

        // Create the itinerary
        const { data: newItinerary, error } = await supabase
            .from('itineraries')
            .insert([{
                trip_id,
                day_number,
                activity,
                location,
                start_time,
                end_time,
                notes
            }])
            .select(`
                *,
                trips:trip_id (
                    id,
                    destination,
                    start_date,
                    end_date,
                    users:user_id (
                        id,
                        name,
                        email
                    )
                )
            `)
            .single();

        if (error) {
            console.error('Supabase error:', error);
            return res.status(500).send({ error: 'Failed to create itinerary' });
        }

        res.status(201).json(newItinerary);
    } catch (err) {
        console.error(err);
        res.status(500).send({ error: 'Internal server error' });
    }
}

const getItineraryById = async (req, res) => {
    try {
        const { id } = req.params;

        // Validate ID is a number
        if (isNaN(id)) {
            return res.status(400).send({ error: 'Invalid itinerary ID' });
        }

        const { data: itinerary, error } = await supabase
            .from('itineraries')
            .select(`
                *,
                trips:trip_id (
                    id,
                    destination,
                    start_date,
                    end_date,
                    users:user_id (
                        id,
                        name,
                        email
                    )
                )
            `)
            .eq('id', id)
            .single();

        if (error) {
            console.error('Supabase error:', error);
            
            if (error.code === 'PGRST116') {
                return res.status(404).send({ error: `No itinerary found with id ${id}` });
            }
            
            return res.status(500).send({ error: 'Failed to fetch itinerary' });
        }

        res.status(200).json(itinerary);
    } catch (err) {
        console.error(err);
        res.status(500).send({ error: 'Internal server error' });
    }
}

const getItinerariesByTripId = async (req, res) => {
    try {
        const { tripId } = req.params;

        // Validate trip ID is a number
        if (isNaN(tripId)) {
            return res.status(400).send({ error: 'Invalid trip ID' });
        }

        const { data: itineraries, error } = await supabase
            .from('itineraries')
            .select(`
                *,
                trips:trip_id (
                    id,
                    destination,
                    start_date,
                    end_date
                )
            `)
            .eq('trip_id', tripId)
            .order('day_number', { ascending: true })
            .order('start_time', { ascending: true });

        if (error) {
            console.error('Supabase error:', error);
            return res.status(500).send({ error: 'Failed to fetch trip itineraries' });
        }

        res.status(200).json(itineraries);
    } catch (err) {
        console.error(err);
        res.status(500).send({ error: 'Internal server error' });
    }
}

const updateItinerary = async (req, res) => {
    try {
        const { id } = req.params;
        const { day_number, activity, location, start_time, end_time, notes } = req.body;

        // Validate ID is a number
        if (isNaN(id)) {
            return res.status(400).send({ error: 'Invalid itinerary ID' });
        }

        // Update the itinerary
        const { data: updatedItinerary, error } = await supabase
            .from('itineraries')
            .update({
                day_number,
                activity,
                location,
                start_time,
                end_time,
                notes
            })
            .eq('id', id)
            .select(`
                *,
                trips:trip_id (
                    id,
                    destination,
                    start_date,
                    end_date
                )
            `)
            .single();

        if (error) {
            console.error('Supabase error:', error);
            
            if (error.code === 'PGRST116') {
                return res.status(404).send({ error: `No itinerary found with id ${id}` });
            }
            
            return res.status(500).send({ error: 'Failed to update itinerary' });
        }

        res.status(200).json(updatedItinerary);
    } catch (err) {
        console.error(err);
        res.status(500).send({ error: 'Internal server error' });
    }
}

const deleteItinerary = async (req, res) => {
    try {
        const { id } = req.params;

        // Validate ID is a number
        if (isNaN(id)) {
            return res.status(400).send({ error: 'Invalid itinerary ID' });
        }

        const { error } = await supabase
            .from('itineraries')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Supabase error:', error);
            return res.status(500).send({ error: 'Failed to delete itinerary' });
        }

        res.status(200).send({ message: 'Itinerary deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).send({ error: 'Internal server error' });
    }
}

module.exports = {
    getAllItineraries,
    createItinerary,
    getItineraryById,
    getItinerariesByTripId,
    updateItinerary,
    deleteItinerary
}