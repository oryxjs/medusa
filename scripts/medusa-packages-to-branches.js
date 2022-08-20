const repoUrl = "https://github.com/oryxjs/medusa.git"
const username = process.env.USERNAME
const password = process.env.PASSWORD
const jsGit = require("simple-git")
const url = new URL(repoUrl)
const authConfig = `credential.${url.origin}.helper='!f() { echo username=${username} && echo password=${password}; }; f'`
const git = jsGit.default({
  config: [authConfig],
})
const fs = require("fs")

async function main() {
  try {
    const status = await git.status()
    if (status.isClean()) {
      return
    }

    // pull new changes first from medusa
    await git.checkout("master")
    await git.pull()

    const packages_dir = process.cwd().concat("/packages")
    fs.readdirSync(packages_dir)
      .filter((p) => !p.startsWith("."))
      .map((p) => {
        // rename a package before creating a branch
        const renamed_package = p.replace(/medusa/, "oryx")
        // each package should be included in a new branch
        git.raw(
          [
            "subtree",
            "split",
            "--prefix",
            `packages/${p}/`,
            "-b",
            renamed_package,
          ],
          (err, resp) => {
            if (err) {
              throw new err()
            }
            git.push("origin", renamed_package, ["-u"])
            console.log(
              "Pull and Creating/Updating subtree branches done successfully \n" +
                resp
            )
          }
        )
      })
  } catch (error) {
    console.log(error)
  }
}

main()
