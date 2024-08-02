import * as yaml from 'js-yaml';

class FrontMatterParser {
  parse(md:string):FrontMatterParserResult {
    const frontmatterRegex = /^---\n([\s\S]*?)\n---/;
    const match = frontmatterRegex.exec(md);
    let frontmatter = {};
    let content = md

    if (match && match[1]) {
      frontmatter = yaml.load(match[1]);
      content = md.replace(frontmatterRegex, '');
    }

    return {
      frontmatter,
      content
    };
  }
}


export class CustomPageFrontMatterParser {
  parse(md:string):{
    frontmatter: CustomPageFrontMatter
    content: string
  }  {
    const customPage = new FrontMatterParser().parse(md);
    if(customPage.frontmatter.slotId !== "custom-page" || !customPage.frontmatter.route || !customPage.frontmatter.title) {
      throw new Error("Invalid custom page frontmatter")
    }
    const result = {
      frontmatter: {
        slotId: customPage.frontmatter.slotId,
        title: customPage.frontmatter.title,
        route: customPage.frontmatter.route.toLowerCase()
      },
      content: customPage.content
    }

    return result
  }
}

export type CustomPageFrontMatter = {
  slotId: "custom-page"
  title: string
  route:string
}

type FrontMatterParserResult = {
  frontmatter: {[key: string]: any}
  content: string
}