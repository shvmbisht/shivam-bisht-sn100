import { Router } from 'express';
import { param } from 'express-validator';
import { performance } from 'perf_hooks';
import { EZone, ICoordinates } from 'src/types/landing-zone.types';
import { drone } from 'src/utils/constants';
import { getCoordinates } from 'src/utils/landing-zone.helpers';
import { validate } from 'src/utils/validation';

const router = Router();

router.get('/', (req, res) => {
  res.send(
    `${drone} needs to fly to find a landing zone, but is not sure which of the 10 landing zones has the correct coordinates.

Since SpaceY is on a tight budget, the rovers we sent in weren't exactly high quality. One of them shared garbage coordinates, while the other one malfunctioned in the middle.

After talking to NASA, however, we found that if all the coordinates shared by our first rover, R1, is includes in the list of coordinates shared by our second rover, R2, then that landing zone is good to go.

But again, since we were on a tight budget, we didn't exactly hire the best engineers. Your task is to fix the isValidLandingZone function in the /landing-zone/:zone endpoint to make sure that the API correctly identifies valid landing zones.

The API accepts a landing zone (Z1, Z2, Z3,... Z10) and returns an object indicating the zone, whether that zone is valid, and the time it took to compute the result.`,
  );
});

router.get(
  '/:zone',
  validate(param('zone', 'Not a valid zone').isIn(Object.values(EZone))),
  async (req, res) => {
    const zone = req.params.zone as EZone;
    const coordinates = await getCoordinates(zone);

    const start = performance.now();

    const isValid = isValidLandingZone(coordinates);
    const end = performance.now();
    res.status(200).send({
      zone,
      isValid,
      elapsedTime: end - start,
    });
  },
);

// Function to update
export const isValidLandingZone = ({ R1: arr1, R2: arr2 }: ICoordinates) => {
  let isValidZone = true;
  const hash = {};
  for (const coordinate in arr1) {
    if (hash.hasOwnProperty(arr1[coordinate])) {
      hash[arr1[coordinate]] += 1;
    } else {
      hash[arr1[coordinate]] = 1;
    }
  }

  // NOW CHECK IF ALL COORDINATE IN R2 ARE PRESENT IN HASH CREATED

  for (const coordinate in arr2) {
    if (!hash.hasOwnProperty(arr2[coordinate])) isValidZone = false;
  }
  return isValidZone;
};

export default router;
