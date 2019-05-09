
//todo is it safe? maybe we should use guid\uuid generation here?
export class CommonUtils {
  static generateRandomFilename(length: number): string {
    var filename: string = "";
    var validChar: string = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (var i = 0; i < length; i++) {
      filename += validChar.charAt(Math.floor(Math.random() * validChar.length));
    }

    return filename;
  }

  static log = (message: string | Chalk.ChalkChain): void => console.log(message);
}
