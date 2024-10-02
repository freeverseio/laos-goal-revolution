import { AppDataSource } from "../AppDataSource";
import { Repository } from "typeorm";
import { Country } from "../entity/Country";
import { NotFoundException } from "../../exceptions/NotFoundException";


export class CountryCustomRepository {
  
  // Count all countries
  async countCountries(): Promise<number> {
    const repository = AppDataSource.getRepository(Country);
    const count = await repository.count();
    return count;
  }

  // Count countries by timezone
  async countCountriesByTimezone(timezoneIdx: number): Promise<number> {
    const repository = AppDataSource.getRepository(Country);
    const count = await repository.count({
      where: {
        timezone_idx: timezoneIdx,
      },
    });
    return count;
  }

  // Insert a country record
  async insertCountry(country: Country): Promise<void> {
    const repository = AppDataSource.getRepository(Country);
    try {
      await repository.insert(country);
    } catch (error) {
      console.error("Error inserting country:", error);
      throw new Error("Insert failed");
    }
  }

  // Find a country by timezone_idx and country_idx
  async findCountryByTimezoneAndCountryIdx(timezoneIdx: number, countryIdx: number): Promise<Country> {
    const repository = AppDataSource.getRepository(Country);
    const country = await repository.findOne({
      where: {
        timezone_idx: timezoneIdx,
        country_idx: countryIdx,
      },
    });

    if (!country) {
      throw new NotFoundException("Country not found");
    }

    return country;
  }
}

// Export the custom repository instance by extending the base repository
export const countryRepository = AppDataSource.getRepository(Country);
