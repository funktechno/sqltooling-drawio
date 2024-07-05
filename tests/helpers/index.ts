import { AssertionError } from "assert";

export const multiAssert = ((asserts: (() => void)[]) => {
    const errors: AssertionError[] = [];
    asserts.forEach((assertFun) => {
        try {
            assertFun();
        } catch (error: any) {
            let message: string | undefined = error?.matcherResult?.message;

            if (message){
                message = message.replace(/\\u001b\[[0-9][0-9]?m/g, "");
                message = message.replace(/\[[0-9][0-9]?m/g, "");
                const split = message.split("\n");
                error.matcherResult.message = split;
            }
            errors.push(error);
        }
    });
    if (errors.length > 0) {
        throw new Error(JSON.stringify(errors, null, 2));
    }
});