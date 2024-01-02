import pool from "@/dbConfig/pgConfig"; 
import knex from "@/dbConfig/knexConfig";
import { NextRequest, NextResponse } from "next/server";

export async function GET(_request: NextRequest) {
    try {
        const result = await pool.query(`SELECT * FROM deductibles`);

        const deductibles = result.rows
        const updatedDeductubkes = await Promise.all(deductibles.map(async (ded) => {
            const salary_deductibles = await pool.query(`SELECT * FROM salary_deductibles WHERE deductible_id = $1`, [ded.deductible_id]);

            ded.canBeTampered = salary_deductibles.rows.length === 0;
            return ded;
          }));
        return NextResponse.json({
            success: true,
            deductibles: updatedDeductubkes,
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const deductibles = await request.json();

        let promises = [];

        for (const deductible of deductibles) {
            if (deductible.name.length === 0) {
              return NextResponse.json(
                { frontendErrorMessage: "Deductible name is required." },
                { status: 400 }
              );
            }
        }

        for (const deductible of deductibles) {
            if (deductible.deductible_id < 10000) { // udeductibles that need an update and are already in the system
                // Check if deductible is assigned to any salary:
                const deductibleAssigned = await knex("salary_deductibles").select("*").where("deductible_id", deductible.deductible_id);
                if (deductibleAssigned.length > 0) { // If deductible is assigned then we only allow udating the name.
                    promises.push(
                        knex("deductibles")
                        .update({ name: deductible.name })
                        .where("deductible_id", deductible.deductible_id)
                        .returning("*")
                    )
                    continue;
                }

                if (deductible.amount) {
                    // Create promise for updating deductible with amount
                    promises.push(
                        knex("deductibles")
                            .update({ amount: deductible.amount, percentage: null, name: deductible.name })
                            .where("deductible_id", deductible.deductible_id)
                            .returning("*")
                    );
                } else {
                    // Create promise for updating deductible with percentage
                    promises.push(
                        knex("deductibles")
                            .update({ amount: null, percentage: deductible.percentage, name: deductible.name })
                            .where("deductible_id", deductible.deductible_id)
                            .returning("*")
                    );
                }
            } else { // new deductibles that arent in the system
                promises.push(
                    knex("deductibles")
                    .insert({ name: deductible.name, amount: deductible?.amount, percentage: deductible?.percentage })
                    .returning("*")
                );
            }
        }
    
        // Execute all promises concurrently
        const results = await Promise.all(promises);

        return NextResponse.json({
            message: "Deductible updated successfully",
            success: true,
            response: results,
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
