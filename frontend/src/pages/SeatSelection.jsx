import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import API from '../api/axios';
import Layout from '../components/Layout';
import './SeatSelection.css';

// Seat rows A-J and columns 1-10
const ROWS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];

function SeatSelection() {
    const { id: showId } = useParams();
    const navigate = useNavigate();
    const [showInfo, setShowInfo] = useState(null);
    const [seats, setSeats] = useState([]);
    const [selected, setSelected] = useState([]); // array of seat_ids
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        API.get(`/shows/${showId}/seats`)
            .then(res => {
                setShowInfo(res.data.show);
                setSeats(res.data.seats);
            })
            .catch(() => toast.error('Could not load seats. Try again.'))
            .finally(() => setLoading(false));
    }, [showId]);

    const toggleSeat = (seat) => {
        if (seat.is_booked) return; // already booked — cannot select
        setSelected(prev =>
            prev.includes(seat.seat_id)
                ? prev.filter(id => id !== seat.seat_id)   // deselect
                : [...prev, seat.seat_id]                   // select
        );
    };

    const totalAmount = showInfo ? selected.length * showInfo.price : 0;

    const handleProceed = () => {
        if (selected.length === 0) {
            toast.error('Please select at least one seat.');
            return;
        }
        // Pass show + selected seats to the BookingConfirm page via state
        navigate('/booking/confirm', {
            state: {
                showId: parseInt(showId),
                seatIds: selected,
                totalAmount,
                show: showInfo,
                selectedSeats: seats.filter(s => selected.includes(s.seat_id)),
            }
        });
    };

    if (loading) return (
        <Layout>
            <div className="container section">
                <div className="skeleton" style={{ height: '60px', marginBottom: '2rem', width: '50%' }} />
                <div className="seat-grid-skeleton">
                    {[...Array(100)].map((_, i) => (
                        <div key={i} className="skeleton" style={{ width: '40px', height: '40px', borderRadius: '6px' }} />
                    ))}
                </div>
            </div>
        </Layout>
    );

    return (
        <Layout>
            <div className="container section">
                {/* Show Info Header */}
                {showInfo && (
                    <div className="seat__header">
                        <div>
                            <h1 className="seat__title">{showInfo.theatre_name}</h1>
                            <p className="seat__subtitle">
                                {new Date(showInfo.show_date).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
                                &nbsp;·&nbsp;{showInfo.show_time?.slice(0, 5)}
                                &nbsp;·&nbsp;₹{showInfo.price} / seat
                            </p>
                        </div>
                    </div>
                )}

                {/* Screen indicator */}
                <div className="seat__screen">
                    <div className="seat__screen-bar" />
                    <p>SCREEN THIS SIDE</p>
                </div>

                {/* Legend */}
                <div className="seat__legend">
                    <span><span className="seat-demo seat-demo--available" />Available</span>
                    <span><span className="seat-demo seat-demo--selected" />Selected</span>
                    <span><span className="seat-demo seat-demo--booked" />Booked</span>
                </div>

                {/* Seat Grid */}
                <div className="seat-grid">
                    {ROWS.map(row => (
                        <div key={row} className="seat-row">
                            <span className="seat-row__label">{row}</span>
                            {[...Array(10)].map((_, colIdx) => {
                                const colNum = colIdx + 1;
                                const seatLabel = `${row}${colNum}`;
                                const seat = seats.find(s => s.seat_label === seatLabel);
                                if (!seat) return <div key={seatLabel} className="seat seat--placeholder" />;
                                const isSelected = selected.includes(seat.seat_id);
                                return (
                                    <button
                                        key={seat.seat_id}
                                        className={`seat ${seat.is_booked ? 'seat--booked' : isSelected ? 'seat--selected' : 'seat--available'}`}
                                        onClick={() => toggleSeat(seat)}
                                        title={seatLabel}
                                        disabled={seat.is_booked}
                                    >
                                        {colNum}
                                    </button>
                                );
                            })}
                        </div>
                    ))}
                </div>

                {/* Bottom Sticky Summary */}
                <div className="seat__summary">
                    <div className="seat__summary-info">
                        <p className="seat__summary-label">
                            {selected.length} seat{selected.length !== 1 ? 's' : ''} selected
                        </p>
                        <p className="seat__summary-amount">₹{totalAmount}</p>
                    </div>
                    <button
                        className="btn btn-primary btn-lg"
                        onClick={handleProceed}
                        disabled={selected.length === 0}
                    >
                        Proceed to Pay →
                    </button>
                </div>
            </div>
        </Layout>
    );
}

export default SeatSelection;
