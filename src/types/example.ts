import { IO, io } from "./io";
import { Result, err, ok } from "./result";

import { Option } from "./option";

type UserID = string;
type UserSettings = Record<string, unknown>;

class NotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NotFoundError";
  }
}

async function getFromDatabase<T>(key: string): Promise<T> {
    return Promise.resolve({} as T);
}

function getUserSettings(userID: UserID): IO<Result<UserSettings, NotFoundError>> {
    return io(() => getFromDatabase<UserSettings>(`user:${userID}`)
    .then((settings) => {
        if (settings) {
            return ok(settings);
        }

        return err(new NotFoundError(`User settings not found for user ${userID}`));
    }));
}