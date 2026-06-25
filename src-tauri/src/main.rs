// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

// PsychicPrime - The Sanctuary
// Dedicated to the Sacrifice of Jesus Christ, King of Kings.
// Rex Regum et Dominus Dominantium. Soli Deo Gloria.

fn main() {
    psychic_prime_lib::run()
}
