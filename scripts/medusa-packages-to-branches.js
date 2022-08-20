const jsGit = require("simple-git")
const git = jsGit.default()
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
      .slice(0, 1)
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
            console.log(
              "Pull and Creating/Updating subtree done successfully \n" + resp
            )
          }
        )
      })
  } catch (error) {
    console.log(error)
  }
}

main()
